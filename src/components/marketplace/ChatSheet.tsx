import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Image as ImageIcon, ArrowLeft, Phone, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: string;
  is_read: boolean;
}

interface ChatSheetProps {
  conversationId: string | null;
  recipientName: string;
  recipientAvatar?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatSheet = ({ 
  conversationId, 
  recipientName, 
  recipientAvatar, 
  open, 
  onOpenChange 
}: ChatSheetProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch messages and subscribe to realtime
  useEffect(() => {
    if (!open || !conversationId) return;
    
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [open, conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !conversationId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;
      
      setNewMessage("");
      
      // Update conversation's last_message_at
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({ title: "Xabar yuborilmadi", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-muted rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <img
            src={recipientAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"}
            alt={recipientName}
            className="w-10 h-10 rounded-full object-cover"
          />
          
          <div className="flex-1">
            <p className="font-semibold">{recipientName}</p>
            <p className="text-xs text-emerald-500">Online</p>
          </div>
          
          <button className="p-2 hover:bg-muted rounded-xl">
            <Phone className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-xl">
            <Video className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Suhbatni boshlang!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-2xl",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {format(new Date(message.created_at), "HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-background">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-xl">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-xl">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Xabar yozing..."
              className="flex-1"
            />
            
            <Button 
              size="icon" 
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
