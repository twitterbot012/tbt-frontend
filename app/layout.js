import "./globals.css";

export const metadata = {
  title: "TwitterBot",
  description: "TwitterBot - Bot that collect and post tweets.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>
                <main>{children}</main>
            </body>
        </html>
    );
}
