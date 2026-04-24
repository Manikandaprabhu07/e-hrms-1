import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findOneByEmail(email: string): Promise<User | null>;
    findOneByEmailOrUsername(emailOrUsername: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
    update(id: string, userData: Partial<User>): Promise<User>;
    remove(id: string): Promise<void>;
}
