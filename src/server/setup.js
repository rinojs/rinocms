import chalk from 'chalk';
import { input, confirm, password } from '@inquirer/prompts';
import { dbDir } from "./config.js";
import bcrypt from 'bcrypt';
import { dbCommandWithTimeout } from './db/dbProxy.js'
import { addAdminAccount } from './db/index.js';

export async function setup()
{

    console.log(`${ chalk.redBright.bgBlack(`
██████╗ ██╗███╗   ██╗ ██████╗ 
██╔══██╗██║████╗  ██║██╔═══██╗
██████╔╝██║██╔██╗ ██║██║   ██║
██╔══██╗██║██║╚██╗██║██║   ██║
██║  ██║██║██║ ╚████║╚██████╔╝
╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ 
                              
 ██████╗███╗   ███╗███████╗   
██╔════╝████╗ ████║██╔════╝   
██║     ██╔████╔██║███████╗   
██║     ██║╚██╔╝██║╚════██║   
╚██████╗██║ ╚═╝ ██║███████║   
 ╚═════╝╚═╝     ╚═╝╚══════╝
`) }
${ chalk.white.bold('Become a sponsor & support Rino CMS!') }
${ chalk.white('https://github.com/sponsors/opdev1004') }
`);

    console.log('Checking Admin...');

    const accountData = await dbCommandWithTimeout(10000, "getMultiple", dbDir, "rinocms", "admin-account", 0, 1);

    if (Object.keys(accountData.data).length !== 0)
    {
        console.log(`${ chalk.green(`✅ Admin already exists.`) }`);
    }
    else
    {
        console.log(`${ chalk.yellow(`⚠️ No admin found. Let\'s set one up: \n`) }`);

        while (true)
        {
            const adminUsername = await input({ message: '* Admin Username:' });
            const adminEmail = await input({ message: '  Admin Email:' });
            const adminPassword = await password({ message: '* Admin Password:', mask: true });
            let confirmPassword = await password({ message: '* Confirm Password:', mask: true });

            if (!adminUsername || !adminEmail || !adminPassword || !confirmPassword)
            {
                console.log(`${ chalk.red(`Username, Email, Password and Confirm Password cannot be blank.`) }`);
                continue;
            }

            if (adminPassword !== confirmPassword)
            {
                console.log(chalk.red('\n❌ Passwords do not match.'));

                const tryAgain = await confirm({
                    message: 'Do you want to try again?',
                    default: true
                });

                if (!tryAgain)
                {
                    console.log(chalk.gray('❎ Setup cancelled.'));
                    process.exit(1);
                }

                continue;
            }

            const now = new Date().toISOString();
            const data = JSON.stringify({
                username: adminUsername,
                email: adminEmail,
                passwordHash: await bcrypt.hash(adminPassword, 10),
                roles: ["admin"],
                isEmailVerified: false,
                createdAt: now,
                updatedAt: now,
            });

            const result = await addAdminAccount(adminUsername, adminEmail, data);

            if (result)
            {
                console.log(chalk.green('✅ Admin account created successfully.'));
            }
            else
            {
                console.log(chalk.red('❌ Something went wrong with DB... Please try again or ask for help.'));
                process.exit(1);
            }
            break;
        }
    }
}