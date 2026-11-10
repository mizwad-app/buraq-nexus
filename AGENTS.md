# Architecture rules

- Keep auth context identity in a realm-wide registry separate from provider components, so versioned preview modules and refreshes cannot disconnect consumers from their provider.