import * as bcrypt from 'bcrypt';

export const bcryptCompare = async (userPassword, currentPassword) => {
  return await bcrypt.compare(userPassword, currentPassword);
};
