import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { ChannelMode } from './mode.enum';

@Entity()
export class chat extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: 'bigint',
    })
    id: number;

    @Column({
        type: 'boolean',
        nullable: false,
        default: false,
    })
    group: boolean;

    @Column({
        type: 'string',
        nullable: true,
        // no default value specified to use null as one
    })
    name: string | null;

    @Column({
        type: 'enum',
        enum: ChannelMode,
        nullable: true,
        // no default value specified to use null as one
    })
    mode: ChannelMode | null;

    @Column({
        type: 'string',
        nullable: true,
        // no default value specified to use null as one
    })
    password: string | null;

    @Column({
        type: 'bigint',
        nullable: true,
        // no default value specified to use null as one
    })
    owner_id: number | null;
}