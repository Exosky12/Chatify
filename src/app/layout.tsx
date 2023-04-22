import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata = {
	title: 'Chatify | Web chat app',
	description: 'Web chat app by Exosky12',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<body className={"bg-[#343541] text-white min-h-100vh"}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
