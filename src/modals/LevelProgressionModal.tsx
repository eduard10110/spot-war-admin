import PracticeConfigController from '@controllers/practiceConfig';
import type { LevelProgressionBand } from '@helpers/types/backend';
import { Form, Input, InputNumber, Modal } from 'antd';
import { useEffect, useState } from 'react';

export interface LevelProgressionModalProps {
  open: boolean;
  initial: LevelProgressionBand | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function LevelProgressionModal({
  open,
  initial,
  onClose,
  onSaved,
}: LevelProgressionModalProps) {
  const [form] = Form.useForm<LevelProgressionBand>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.setFieldsValue(initial);
    } else {
      form.resetFields();
    }
  }, [open, initial, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const ok = await PracticeConfigController.upsertLevelProgression(values);
      if (ok) {
        onSaved();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={initial ? `Edit progression L${initial.level}` : 'Add progression band'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      width={480}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item name="level" label="Player level" rules={[{ required: true }]}>
          <InputNumber min={1} max={500} className="w-full" disabled={Boolean(initial)} />
        </Form.Item>
        <Form.Item name="minXp" label="Min XP" rules={[{ required: true }]}>
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item name="maxXp" label="Max XP" rules={[{ required: true }]}>
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="Rookie" />
        </Form.Item>
        <Form.Item name="rewardCoins" label="Reward coins" rules={[{ required: true }]}>
          <InputNumber min={0} className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
