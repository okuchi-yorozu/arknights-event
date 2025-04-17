import Image from 'next/image';

import { Space } from 'antd';

type ThumbnailsProps = {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export const Thumbnails = ({
  url = '/as-s-4.jpeg',
  alt = '企画のサムネイル',
  width = 1280,
  height = 720,
}: ThumbnailsProps) => {
  return (
    <Space>
      <Image src={url} alt={alt} width={width} height={height} className='rounded-lg mb-8' />
    </Space>
  );
};
