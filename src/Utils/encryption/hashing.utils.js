import bcrypt from 'bcryptjs';
export const hashData = (data , salt = process.env.Hash_salt_default) => {
    return bcrypt.hashSync(data, Number(salt));
}

export const compareHash = (data, hash) => {
    return bcrypt.compareSync(data, hash);
}
