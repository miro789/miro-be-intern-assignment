import { Entity, ManyToOne, Unique, JoinColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

// Similar to Django's unique_together
@Entity("user_follows")
@Unique(["follower", "following"])
export class UserFollow extends BaseEntity {
    @ManyToOne(() => User, user => user.following)
    @JoinColumn({ name: "followerId" })
    follower: User;

    @ManyToOne(() => User, user => user.followers)
    @JoinColumn({ name: "followingId" })
    following: User;
}
