'use client';

import { createSubmission } from '@/lib/firebase/submissions';
import type { Submission } from '@/types/submission';

import { useState } from 'react';

import { Descriptions, Form, Modal, Tag, message } from 'antd';

import { FormButton } from '../atoms';
import {
  ConceptField,
  DoctorHistoryField,
  EditingField,
  IntroductionField,
  StageFields,
  TwitterField,
  YoutubeUrlField,
} from '../molecules';

type FormData = Omit<Submission, 'id' | 'createdAt'>;

export const VideoSubmissionForm = () => {
  const [form] = Form.useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<FormData | null>(null);

  const handleSubmit = async (values: FormData) => {
    setFormValues(values);
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!formValues) return;

    setIsSubmitting(true);
    try {
      await createSubmission(formValues);
      messageApi.success('投稿が完了しました!');
      form.resetFields();
      setConfirmModalOpen(false);
    } catch (error) {
      console.error('投稿エラー:', error);
      messageApi.error('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDoctorHistoryText = (value: string) => {
    const mapping: Record<string, string> = {
      'less-than-6months': '6ヶ月未満',
      '6months-1year': '6ヶ月〜1年',
      '1-2years': '1年〜2年',
      '2-3years': '2年〜3年',
      'more-than-3years': '3年以上',
    };
    return mapping[value] || value;
  };

  return (
    <>
      {contextHolder}
      <Form form={form} layout='vertical' onFinish={handleSubmit} size='large' requiredMark>
        <YoutubeUrlField />
        <ConceptField />
        <EditingField />
        <StageFields />
        <TwitterField />
        <DoctorHistoryField />
        <IntroductionField />

        <Form.Item className='mb-0'>
          <FormButton type='primary' htmlType='submit' loading={isSubmitting} block>
            {isSubmitting ? '送信中...' : '投稿する'}
          </FormButton>
        </Form.Item>
      </Form>

      <Modal
        title='投稿内容の確認'
        open={confirmModalOpen}
        onOk={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        okText='投稿する'
        cancelText='戻る'
        width={800}
        confirmLoading={isSubmitting}
      >
        {formValues && (
          <Descriptions bordered column={1} size='small' labelStyle={{ width: '150px' }}>
            <Descriptions.Item label='YouTubeのURL'>
              <a href={formValues.youtubeUrl} target='_blank' rel='noopener noreferrer'>
                {formValues.youtubeUrl}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label='コンセプト'>
              <div className='whitespace-pre-wrap'>{formValues.concept}</div>
            </Descriptions.Item>
            <Descriptions.Item label='編集'>
              {formValues.hasEditing === 'edited' ? '編集あり' : '編集なし'}
            </Descriptions.Item>
            <Descriptions.Item label='ステージ'>{formValues.stage}</Descriptions.Item>
            <Descriptions.Item label='難易度'>
              <Tag color={formValues.difficulty === 'normal' ? 'blue' : 'red'}>
                {formValues.difficulty === 'normal' ? '通常' : '強襲作戦'}
              </Tag>
            </Descriptions.Item>
            {formValues.twitterHandle && (
              <Descriptions.Item label='X'>
                <a
                  href={`https://twitter.com/${formValues.twitterHandle.replace('@', '')}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {formValues.twitterHandle}
                </a>
              </Descriptions.Item>
            )}
            <Descriptions.Item label='ドクター歴'>
              {getDoctorHistoryText(formValues.doctorHistory)}
            </Descriptions.Item>
            {formValues.introduction && (
              <Descriptions.Item label='自己紹介・備考'>
                <div className='whitespace-pre-wrap'>{formValues.introduction}</div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </>
  );
};
