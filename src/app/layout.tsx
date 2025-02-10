import { AntdRegistry } from '@ant-design/nextjs-registry';

import { Noto_Sans_JP } from 'next/font/google';

import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import jaJP from 'antd/locale/ja_JP';

import './globals.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'アークナイツ攻略動画投稿フォーム',
  description: 'アークナイツの攻略動画を投稿するためのフォームです',
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="ja">
    <body className={notoSansJP.className}>
      <AntdRegistry>
        <ConfigProvider
          locale={jaJP}
          theme={{
            token: {
              fontFamily: notoSansJP.style.fontFamily,
              colorPrimary: '#1677ff',
              borderRadius: 6,
            },
            components: {
              Form: {
                labelFontSize: 16,
                controlHeight: 40,
              },
              Input: {
                controlHeight: 40,
              },
              Select: {
                controlHeight: 40,
              },
              Button: {
                controlHeight: 44,
                fontSize: 16,
              },
            },
          }}
        >
          {children}
        </ConfigProvider>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;
