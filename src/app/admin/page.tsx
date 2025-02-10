'use client';

import { useEffect, useState } from 'react';
import { Table, Typography, Tag, Space, Button, Dropdown, Checkbox } from 'antd';
import { YoutubeOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { getSubmissions } from '@/lib/firebase/submissions';
import type { Submission } from '@/types/submission';
import '@ant-design/v5-patch-for-react-19';

const { Title, Paragraph } = Typography;

const DEFAULT_VISIBLE_COLUMNS = [
  'index',
  'createdAt',
  'youtubeUrl',
  'concept',
  'hasEditing',
  'stage',
  'difficulty',
  'twitterHandle',
  'doctorHistory',
];

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visibleColumns');
      return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
    }
    return DEFAULT_VISIBLE_COLUMNS;
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await getSubmissions();
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const allColumns: ColumnsType<Submission> = [
    {
      title: 'No',
      key: 'index',
      width: 80,
      render: (_text, _record, index) => index + 1,
      fixed: 'left',
    },
    {
      title: '投稿日時',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => date.toLocaleString(),
      sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      defaultSortOrder: 'descend',
      width: 180,
    },
    {
      title: 'YouTube',
      dataIndex: 'youtubeUrl',
      key: 'youtubeUrl',
      render: (url: string) => (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#FF0000] hover:text-[#FF0000] hover:opacity-80 text-2xl"
        >
          <YoutubeOutlined />
        </a>
      ),
      width: 100,
      align: 'center',
    },
    {
      title: 'コンセプト',
      dataIndex: 'concept',
      key: 'concept',
      render: (text: string) => (
        <Paragraph
          ellipsis={{ 
            rows: 3,
            expandable: true,
            symbol: 'もっと見る'
          }}
          className="whitespace-pre-wrap mb-0"
        >
          {text}
        </Paragraph>
      ),
      width: 300,
    },
    {
      title: '編集',
      dataIndex: 'hasEditing',
      key: 'hasEditing',
      render: (value: string) => (value === 'edited' ? '編集あり' : '編集なし'),
      width: 100,
    },
    {
      title: 'ステージ',
      dataIndex: 'stage',
      key: 'stage',
      filters: Array.from(new Set(submissions.map(s => s.stage))).map(stage => ({
        text: stage,
        value: stage,
      })),
      onFilter: (value, record) => record.stage === value,
      filterSearch: true,
      width: 120,
    },
    {
      title: '難易度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (value: string) => (
        <Tag color={value === 'normal' ? 'blue' : 'red'}>
          {value === 'normal' ? '通常' : '強襲作戦'}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'X',
      dataIndex: 'twitterHandle',
      key: 'twitterHandle',
      render: (handle: string | undefined) => 
        handle ? (
          <a 
            href={`https://twitter.com/${handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80"
          >
            <Space align="center">
              <span>{handle}</span>
            </Space>
          </a>
        ) : '-',
      width: 200,
    },
    {
      title: 'ドクター歴',
      dataIndex: 'doctorHistory',
      key: 'doctorHistory',
      render: (value: string) => {
        const mapping: Record<string, string> = {
          'less-than-6months': '6ヶ月未満',
          '6months-1year': '6ヶ月〜1年',
          '1-2years': '1年〜2年',
          '2-3years': '2年〜3年',
          'more-than-3years': '3年以上',
        };
        return mapping[value] || value;
      },
      width: 120,
    },
  ];

  const columnSettings: MenuProps['items'] = allColumns.map(column => ({
    key: column.key as string,
    label: (
      <Checkbox
        checked={visibleColumns.includes(column.key as string)}
        onChange={(e) => {
          if (e.target.checked) {
            setVisibleColumns([...visibleColumns, column.key as string]);
          } else {
            setVisibleColumns(visibleColumns.filter(key => key !== column.key));
          }
        }}
      >
        {column.title as string}
      </Checkbox>
    ),
  }));

  const visibleColumnsList = allColumns.filter(column => 
    visibleColumns.includes(column.key as string)
  );

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Title level={2} className="!mb-0">
            投稿一覧
          </Title>
          <Space size="middle">
            <Tag color="blue" className="text-lg px-4 py-1">
              投稿件数: {submissions.length}件
            </Tag>
            <Dropdown
              menu={{ items: columnSettings }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button icon={<SettingOutlined />}>
                表示カラム設定
              </Button>
            </Dropdown>
          </Space>
        </div>
        <Table
          columns={visibleColumnsList}
          dataSource={submissions}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1500 }}
          expandable={{
            expandedRowRender: (record) => (
              <p className="p-4">{record.introduction || '自己紹介・備考なし'}</p>
            ),
            rowExpandable: (record) => Boolean(record.introduction),
          }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `全${total}件`,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </div>
    </main>
  );
}
