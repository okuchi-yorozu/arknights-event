'use client';

import { LockOutlined } from '@ant-design/icons';

import { useState } from 'react';

import { Button, Form, Input, message } from 'antd';

interface Props {
  onSuccess: () => void;
}

export const PasswordForm = ({ onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { password: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: values.password }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        message.error('パスワードが正しくありません');
      }
    } catch {
      message.error('認証に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
        <div>
          <h2 className='text-center text-2xl font-bold'>管理者ページ</h2>
          <p className='mt-2 text-center text-gray-600'>パスワードを入力してください</p>
        </div>
        <Form name='password' onFinish={onFinish} autoComplete='off' size='large'>
          <Form.Item
            name='password'
            rules={[{ required: true, message: 'パスワードを入力してください' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='パスワード' />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading} block>
              ログイン
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
