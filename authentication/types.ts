export type EmailAndPassword = { email: string; password: string };
export type UserAndEmail = { email: string; user: string };
export type UserAndEmailAndPassword = { user: string } & EmailAndPassword;
