import z from "zod";

const LoginUserSchema = z.object({
    email: z.string({ error: (iss) => iss.input === undefined ? "Email is required" : iss.message }).email(),
    password: z.string({ error: (iss) => iss.input === undefined ? "Password is required" : iss.message }).min(6)
});

const SignupUserSchema = z.object({
    email: z.string({ error: (iss) => iss.input === undefined ? "Email is required" : iss.message }).email(),
    password: z.string({ error: (iss) => iss.input === undefined ? "Password is required" : iss.message }).min(6),
    name: z.string({ error: (iss) => iss.input === undefined ? "Name is required" : iss.message }).min(2)
});

type LoginUserType = z.infer<typeof LoginUserSchema>;
type SignupUserType = z.infer<typeof SignupUserSchema>;

export { 
    LoginUserSchema,
    LoginUserType,
    SignupUserSchema,
    SignupUserType
};