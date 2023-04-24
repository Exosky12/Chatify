<p align="center">
    <a href="https://github.com/Exosky12/Chatify">
        <img src="https://chatify-exosky.vercel.app/_next/image?url=%2Flogo.png&w=640&q=75" height="140">
    </a>
</p>
<h1 align="center">Chatify</h1>
<p align="center">Web realtime chat app.</p>

## Installation

Vous pouvez accéder a Chatify par plusieurs moyens: <br><br>
<a href="https://chatify-exosky.vercel.app/">-> En vous rendant sur le site internet hébergé sur vercel.</a> <br>
-> Ou en hébergeant chatify directement en local sur votre ordinateur, pour cela: <br><br>
- Veuillez d'abord cloner le repository github:
```sh
git clone https://github.com/Exosky12/Chatify.git
```
- Ensuite, veuillez naviguer à l'intérieur du dossier:
```sh
cd Chatify
```
- Par la suite vous devrez installer les dépendances du projet:
> Avec npm:
```sh
npm install
```
> Avec pnpm:
```sh
pnpm install
```
> Avec yarn:
```sh
yarn install
```

## Fonctionnalitées

- 👤 [**Magic link**](#-magic-link)
- ➕ [**Ajouter des amis**](#Ajouter-des-amis)
- ⛔ [**Gestion d'erreurs**](#Gestion-d'erreurs)
- 📱  [**Responsive**](#Responsive)
- 🔔 [**Notifications**](#Notifications)
- 🔐 [**API sécurisée**](#API-sécurisée)

### 👤 **Magic link**
Pour s'authentifier sur Chatify, l'utilisateur doit entrer son adresse e-mail dans ce formulaire: <br><br>
<p align="center">
    <img src="https://media.discordapp.net/attachments/714830431886901349/1100018801073991772/image.png" height="300">
</p>
Une fois cliqué sur **"Envoyer le magic link"**, l'utilisateur recevera quelques instants plus tard, un mail comme celui-ci: <br><br>
<p align="center">
    <img src="https://media.discordapp.net/attachments/714830431886901349/1100019700097884262/image.png?width=1260&height=556" height="300">
</p>
Cet e-mail est envoyé automatiquement à chaque envoie du magic link par <a href="https://sendgrid.com/">sendgrid</a>, un protocole SMTP envoie le mail en créant un nouveau token.<br>
Dans la base de données, ce token ressemble à ceci: <br><br>
<p align="center">
    <img src="https://media.discordapp.net/attachments/714830431886901349/1100021445607817276/image.png" height="100">
</p>
Si le token n'a pas été utilisé au bout de 22h, alors il expire et devient inutilisable afin de protéger le compte de l'utilisateur. <br>
Aussi, afin de protéger son compte, si le token a déjà été utilisé, alors il expire et devient inutilisable. <br><br>
<p align="center">
    <img src="https://media.discordapp.net/attachments/714830431886901349/1100022579424669776/image.png?width=581&height=590" height="300">
</p>
En cliquant sur "Sign in" vous allez être redirigé vers un lien comme celui-ci: <br> <br>

> https://u33729675.ct.sendgrid.net/ls/click?upn=263EgPbMQBA-2BUO0DFxCWrV0bUOTn2i7uPCmioamrsKa3GmbTs1tLHJe2t-2B3k-2F6Y0XYckj9F1znGjrEr7GOusdbhG4L9pg1hO-2FO1Iyuycvdzso4UWvM-2BtS85VkALk-2FOsmLyFbwPN4zq-2FB1WH5SifcKJvp0moMEt75Qe7NxDNJMWizYPQ8N8PeWhkm2FdKYGVqaijs34G6IwyUZgQ26zx56SyZjbLJzndBxBEdo141vQCO5LyNiPLN2NUO9RaXz0lVuCH91FuFt-2Bfjlh0YgR7TtA-3D-3Do1CO_S-2FUYHH11vcKC2JHZzpUnJhJNaivGXcdrd0pU-2BtRMyxG9T-2Fx4jS9l4DcCbx9sVGzXsIexgeyy0P-2Btbue8hsnzawRTiMHK7uahCg-2B7tTMXWu9eN-2BMe6nvblbZaykjDR1kf-2Bi2zuL-2BxaOs-2BT60xTMiJxLoLhbuUOZ84fSyHNrUYLA3LzCrxFsrEBlPebOtpvgDZDrGjX5EwFLQNHTnqBMK0khKbMpP2PpGBDXyim5r0Fws-3D

<br>
C'est un token JWT (JSON Web Token), il va vérifier que le token JWT de ce lien existe en database, si il exsite, alors il connecte l'utilisateur en lui créeant une session persistante, si non, il redirige vers une page d'erreur comme ci-dessus. <br>
Voici le code pour intégrer ce système de magic link: <br><br>

```ts
import { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter';
import { db } from '@/lib/db';
import {fetchRedis} from "@/helpers/redis";

export const authOptions: NextAuthOptions = {
	adapter: UpstashRedisAdapter(db),
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/login',
	},
	providers: [
		EmailProvider({
			server: {
				host: process.env.EMAIL_SERVER_HOST,
				port: process.env.EMAIL_SERVER_PORT,
				auth: {
					user: process.env.EMAIL_SERVER_USER,
					pass: process.env.EMAIL_SERVER_PASSWORD,
				},
			},
			from: process.env.EMAIL_FROM,
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			const dbUserResult = (await fetchRedis('get', `user:${token.id}`)) as
				| string
				| null

			if (!dbUserResult) {
				if (user) {
					token.id = user!.id
				}

				return token
			}

			const dbUser = JSON.parse(dbUserResult) as User

			return {
				id: dbUser.id,
				email: dbUser.email,
			};
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.email = token.email;
			}

			return session;
		},
		redirect() {
			return '/dashboard/add';
		},
	},
};
```
#### Explication du code

```ts
adapter: UpstashRedisAdapter(db),
```
> C'est l'adapter NextAuth avec la base de données Upstash et Redis l'outil que j'ai utilisé pour communiquer avec la bdd. <br><br>
```ts
session: {
		strategy: 'jwt',
	},
```
> Ici je défini le type de strategy pour la session ( JWT ) <br><br>
```ts
pages: {
		signIn: '/login',
	},
```
> C'est l'url de la page de connexion. <br>
<br>
```ts
providers: [
		EmailProvider({
			server: {
				host: process.env.EMAIL_SERVER_HOST,
				port: process.env.EMAIL_SERVER_PORT,
				auth: {
					user: process.env.EMAIL_SERVER_USER,
					pass: process.env.EMAIL_SERVER_PASSWORD,
				},
			},
			from: process.env.EMAIL_FROM,
		}),
	],
```
> Ici c'est l'EmailProvider, je fournis les variables d'environnement nécessaires afin de pouvoir envoyer les mails automatiquement via SMTP. <br><br>
```ts
async jwt({ token, user }) {
			const dbUserResult = (await fetchRedis('get', `user:${token.id}`)) as
				| string
				| null

			if (!dbUserResult) {
				if (user) {
					token.id = user!.id
				}

				return token
			}

			const dbUser = JSON.parse(dbUserResult) as User

			return {
				id: dbUser.id,
				email: dbUser.email,
			};
		},
async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.email = token.email;
			}

			return session;
		},
		redirect() {
			return '/dashboard/add';
		},
```
> Ici je vais chercher dans la bdd avec la méthode get et le contenu user suivi de l'id du token.
> Ensuite je vérifie si un utilisateur a été trouvé, pour ensuite retourner la session et rediriger l'utilisateur vers la page **/dashboard/add**
