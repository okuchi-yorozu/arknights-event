'use client';

import '@ant-design/v5-patch-for-react-19';

import { useState } from 'react';

import { Thumbnails } from '@/components/molecules/Thumbnails';
import { VideoSubmissionForm } from '@/components/organisms';
import { EventSubmissionGuidelines } from '@/components/organisms/EventSubmissionGuidelines';
import { FormLayout } from '@/components/templates';

export default function GOSubmissionPage() {
  return (
    <FormLayout title='イベント『落日の向こうへ』攻略動画募集'>
      <Thumbnails />
      <EventSubmissionGuidelines />
      <VideoSubmissionForm
        stages={[{ value: 'go-ex-8', label: 'GO-EX-8' }]}
        defaultStage='go-ex-8'
      />
    </FormLayout>
  );
}
