import DifferenceImageMarker from '@components/DifferenceImageMarker';
import type { SpotMarker } from '@components/DifferenceImageMarker';
import PracticeConfigController from '@controllers/practiceConfig';
import StorageUpload from '@controllers/storageUpload';
import type { PracticeLevelCatalog } from '@helpers/types/backend';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Select, Typography, Upload } from 'antd';
import { useRef, useState } from 'react';

export interface PracticeLevelModalProps {
  open: boolean;
  initial: PracticeLevelCatalog | null;
  onClose: () => void;
  onSaved: () => void;
}

const { Text } = Typography;

export default function PracticeLevelModal({ open, initial, onClose, onSaved }: PracticeLevelModalProps) {
  const [form] = Form.useForm<PracticeLevelCatalog>();
  const [submitting, setSubmitting] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [differencesFile, setDifferencesFile] = useState<File | null>(null);
  const [playfieldPreview, setPlayfieldPreview] = useState<string | null>(null);
  const [markers, setMarkers] = useState<SpotMarker[]>([]);
  const blobUrlRef = useRef<string | null>(null);

  const revokePlayfieldBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const setPlayfieldFile = (file: File | null) => {
    revokePlayfieldBlob();
    setDifferencesFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      setPlayfieldPreview(url);
      setMarkers([]);
    } else {
      setPlayfieldPreview(initial?.imageUri ?? null);
    }
  };

  const syncFormWhenOpened = (visible: boolean) => {
    if (!visible) {
      revokePlayfieldBlob();
      setOriginalFile(null);
      setDifferencesFile(null);
      return;
    }
    setOriginalFile(null);
    setDifferencesFile(null);
    revokePlayfieldBlob();
    const row = initial;
    if (row) {
      form.setFieldsValue(row);
      setMarkers(row.differences?.length ? row.differences.map((d) => ({ ...d })) : []);
      setPlayfieldPreview(row.imageUri);
    } else {
      form.resetFields();
      form.setFieldsValue({
        difficulty: 'easy',
        timeLimitSec: 90,
        imageUri: '',
        referenceUri: '',
      });
      setMarkers([]);
      setPlayfieldPreview(null);
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();

    if (markers.length < 1) {
      Modal.warning({
        title: 'Mark difference spots',
        content: 'Click on the playfield image to add at least one spot.',
      });
      return;
    }

    let imageUri = values.imageUri?.trim() ?? '';
    let referenceUri = values.referenceUri?.trim() ?? '';

    if (differencesFile) {
      imageUri = await StorageUpload.practiceLevelImage(values.level, differencesFile, 'differences');
    }
    if (originalFile) {
      referenceUri = await StorageUpload.practiceLevelImage(values.level, originalFile, 'original');
    }

    const isEdit = Boolean(initial);
    if (!isEdit && (!originalFile || !differencesFile)) {
      Modal.warning({
        title: 'Two images required',
        content: 'Upload the original image and the image with differences separately.',
      });
      return;
    }
    if (isEdit && !imageUri) {
      Modal.warning({
        title: 'Playfield image missing',
        content: 'Upload the “with differences” image or keep the existing asset.',
      });
      return;
    }
    if (isEdit && !referenceUri) {
      Modal.warning({
        title: 'Original image missing',
        content: 'Upload the original image or keep the existing asset.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const ok = await PracticeConfigController.upsertPracticeLevel({
        ...values,
        imageUri,
        referenceUri,
        differences: markers.map((m) => ({ id: m.id, x: m.x, y: m.y })),
      });
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
      title={initial ? `Edit level ${initial.level}` : 'Add practice level'}
      open={open}
      afterOpenChange={syncFormWhenOpened}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      width={800}
      destroyOnClose
    >
      <Text type="secondary" className="mb-4 block text-sm">
        Upload the <strong>original</strong> and <strong>with-differences</strong> images, then click the playfield to
        place every spot players must find (percent coordinates).
      </Text>
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item name="level" label="Level #" rules={[{ required: true }]}>
          <InputNumber min={1} className="w-full" disabled={Boolean(initial)} />
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="Practice 1" />
        </Form.Item>

        <Form.Item label="Original image (reference)" required={!initial}>
          <Upload
            maxCount={1}
            accept="image/*"
            beforeUpload={(f) => {
              setOriginalFile(f);
              return false;
            }}
            onRemove={() => setOriginalFile(null)}
          >
            <Button icon={<UploadOutlined />}>
              {initial?.referenceUri ? 'Replace original…' : 'Upload original…'}
            </Button>
          </Upload>
          {initial?.referenceUri ? (
            <Text type="secondary" className="mt-1 block text-xs">
              Current: {initial.referenceUri.slice(0, 48)}…
            </Text>
          ) : null}
        </Form.Item>

        <Form.Item label="Image with differences (playfield)" required={!initial}>
          <Upload
            maxCount={1}
            accept="image/*"
            beforeUpload={(f) => {
              setPlayfieldFile(f);
              return false;
            }}
            onRemove={() => setPlayfieldFile(null)}
          >
            <Button icon={<UploadOutlined />}>
              {initial?.imageUri ? 'Replace playfield…' : 'Upload with differences…'}
            </Button>
          </Upload>
          {initial?.imageUri ? (
            <Text type="secondary" className="mt-1 block text-xs">
              Current: {initial.imageUri.slice(0, 48)}…
            </Text>
          ) : null}
        </Form.Item>

        <Form.Item name="referenceUri" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="imageUri" hidden>
          <Input />
        </Form.Item>

        <DifferenceImageMarker
          title="Mark differences on playfield"
          imageUrl={playfieldPreview}
          markers={markers}
          onChange={setMarkers}
        />

        <Form.Item name="difficulty" label="Difficulty" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
          />
        </Form.Item>
        <Form.Item name="timeLimitSec" label="Time limit (seconds)" rules={[{ required: true }]}>
          <InputNumber min={10} max={600} className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
