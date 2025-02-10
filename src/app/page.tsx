'use client';

import { VideoSubmissionForm } from '@/components/organisms';
import { EventSubmissionGuidelines } from '@/components/organisms/PlanRule';
import { FormLayout } from '@/components/templates';
import '@ant-design/v5-patch-for-react-19';

export default function Home() {
  return (
    <FormLayout title="アークナイツ攻略動画投稿フォーム">
      <EventSubmissionGuidelines />
      <VideoSubmissionForm />
    </FormLayout>
  );
}
