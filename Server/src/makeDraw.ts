import { Room } from "./Room";
import { User } from "./User";

export const makeDraw = (room: Room) => {
    const userWithExclusions = getUserWithExclusions(room).sort((a, b) => b.exclusions.length - a.exclusions.length);
    const chosenPairs = [] as Pair[];

    for(const userE of userWithExclusions) {
        const availableUsers = getAvailableUsers(userE.user, room.users, userE.exclusions, chosenPairs);

        if(availableUsers.length <= 0) {
            return false;
        }

        const chosenUser = availableUsers
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)[0];

        chosenPairs.push({
            giving: userE.user,
            recipient: chosenUser
        });
    }

    const incorrects = drawNumberOfIncorrect(room.users, chosenPairs);

    if(incorrects !== 0) {
        console.log(`There is ${incorrects} incorrect elements`);
        return false;
    }


    room.users.forEach(u => {
        const pair = chosenPairs.find(p => p.giving === u);

        u.sendMessage(JSON.stringify({
            type: "serverUserChosenRecipient",
            data: {
                userId: u.id,
                recipient: {
                    id: pair.recipient.id,
                    name: pair.recipient.name
                }
            }
        }))
    })

    return true;
}

const getUserWithExclusions = (room: Room) => {
    return room.users.map(u => {
        const exclusions = room.exclusions.find(e => e.userId === u.id);
        const userExc = exclusions.excludedUsers.map(e => room.users.find(u => u.id === e)!);
        return {
            user: u,
            exclusions: userExc
        }
    })
}

interface UserWithExclusion {
    user: User,
    exclusions: User[]
}

const getAvailableUsers = (user: User, users: User[], exclusions: User[], chosenPairs: Pair[]) => {
    return users.filter(u => chosenPairs.filter(cp => cp.recipient !== u))
        .filter(u => !exclusions.includes(u))
        .filter(u => u.id !== user.id)
}


interface Pair {
    giving: User;
    recipient: User;
}

const drawNumberOfIncorrect = (users: User[], chosenPairs: Pair[]) => {
    const checks = users.map(u => ({
        givingNum: chosenPairs.filter(cp => cp.giving === u).length,
        recipientNum: chosenPairs.filter(cp => cp.recipient === u).length,
        isOwnRecipient: (chosenPairs.find(cp => cp.giving === u)?.recipient === u ? true : false)
    }));

    return checks.filter(el => el.givingNum !== 1 || el.recipientNum !== 1 || el.isOwnRecipient === true).length;
}