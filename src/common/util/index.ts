import bycrypt from 'bcrypt';
import z from 'zod';

const zodText = z.string().min(1, "Text cannot be empty").max(72, "Text exceeds maximum length of 72 bytes for bcrypt");

const encrypt = (text: z.infer<typeof zodText>, options?: { saltRounds?: number }): string => {
    const parsedText = zodText.parse(text); // This will throw if the text is invalid, ensuring we only hash valid strings
    const saltRounds = options?.saltRounds || 10;
    const salt = bycrypt.genSaltSync(saltRounds);
    return bycrypt.hashSync(parsedText, salt);
}

const compare = (text: string, hash: string): boolean => {
    return bycrypt.compareSync(text, hash);
}

export {
    encrypt,
    compare
}