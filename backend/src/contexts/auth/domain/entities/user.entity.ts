export interface UserProps {
    id?: string;
    email: string;
    name?: string;
    passwordHash?: string;
    googleId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly passwordHash?: string;
    readonly googleId?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: UserProps) {
        this.id = props.id ?? `user--${crypto.randomUUID()}`;
        this.email = props.email.toLowerCase();
        this.name = props.name ?? '';
        this.passwordHash = props.passwordHash;
        this.googleId = props.googleId;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
