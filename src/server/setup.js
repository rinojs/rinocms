import chalk from 'chalk';
import { input, confirm, password } from '@inquirer/prompts';
import { dbDir, logDir, DB_TIMEOUT } from "./config.js";
import bcrypt from 'bcrypt';
import { dbCommandWithTimeout } from './db/dbProxy.js'
import fs from 'fs/promises';

function buildAccountKey(username, email)
{
    return `${ username }@@${ email }`;
}

function parseTableEntry(key, rawValue)
{
    try
    {
        return { key, data: JSON.parse(rawValue) };
    }
    catch
    {
        return null;
    }
}

async function getTableEntries(table)
{
    const result = await dbCommandWithTimeout(DB_TIMEOUT, "getall", dbDir, "rinocms", table);
    if (!result || typeof result !== 'object') return [];

    return Object.entries(result)
        .map(([key, rawValue]) => parseTableEntry(key, rawValue))
        .filter(Boolean);
}

async function migrateLegacyAdminAccounts()
{
    const legacyAdmins = await getTableEntries('admin-account');

    for (const admin of legacyAdmins)
    {
        const existing = await dbCommandWithTimeout(DB_TIMEOUT, "get", dbDir, "rinocms", "account", admin.key);
        if (existing) continue;

        const roles = Array.isArray(admin.data.roles) ? admin.data.roles : [];
        const mergedRoles = Array.from(new Set([...roles, 'admin']));
        const accountData = {
            ...admin.data,
            roles: mergedRoles,
            updatedAt: new Date().toISOString(),
        };

        await dbCommandWithTimeout(
            DB_TIMEOUT,
            "add",
            dbDir,
            "rinocms",
            "account",
            admin.key,
            JSON.stringify(accountData)
        );
    }
}

async function hasAdminAccount()
{
    const accounts = await getTableEntries('account');
    return accounts.some((account) => Array.isArray(account.data.roles) && account.data.roles.includes('admin'));
}

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

    // Ensure required directories exist
    const directories = [dbDir, logDir];
    for (const dir of directories)
    {
        try
        {
            await fs.access(dir);
            console.log(chalk.gray(`✅ Directory already exists: ${ dir }`));
        }
        catch
        {
            await fs.mkdir(dir, { recursive: true, mode: 0o755 });
            console.log(chalk.green(`📁 Created directory: ${ dir }`));
        }
    }

    console.log('Checking Admin...');
    await migrateLegacyAdminAccounts();

    if (await hasAdminAccount())
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
            const accountKey = buildAccountKey(adminUsername, adminEmail);
            const data = JSON.stringify({
                username: adminUsername,
                email: adminEmail,
                passwordHash: await bcrypt.hash(adminPassword, 10),
                roles: ["admin"],
                isEmailVerified: false,
                createdAt: now,
                updatedAt: now,
            });

            const result = await dbCommandWithTimeout(
                DB_TIMEOUT,
                "add",
                dbDir,
                "rinocms",
                "account",
                accountKey,
                data
            );

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
