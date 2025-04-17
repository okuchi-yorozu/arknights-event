'use client';

import '@ant-design/v5-patch-for-react-19';

import ContractCalculator from '@/components/organisms/ContractCalculator';
import { FormLayout } from '@/components/templates';

export default function GOEventCalculatorPage() {
  return (
    <FormLayout title='イベント『落日の向こうへ』契約計算機'>
      <ContractCalculator
        fiveStarOperatorImages={[
          '/img/operators/five_stars/エリジウム.png',
          '/img/operators/five_stars/テキサス.png',
          '/img/operators/five_stars/ファイヤーホイッスル.png',
          '/img/operators/five_stars/バイソン.png',
          '/img/operators/five_stars/フィリオプシス.png',
          '/img/operators/five_stars/クエルクス.png',
          '/img/operators/five_stars/シーン.png',
          '/img/operators/five_stars/スプリア.png',
          '/img/operators/five_stars/プロヴァンス.png',
          '/img/operators/five_stars/ファイヤーウォッチ.png',
          '/img/operators/five_stars/エイプリル.png',
          '/img/operators/five_stars/ヴァラルクビン.png',
        ]}
      />
    </FormLayout>
  );
}
