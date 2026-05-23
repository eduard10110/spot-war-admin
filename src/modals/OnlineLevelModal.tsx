import DifferenceImageMarker, {
  differenceImageClass,
  differenceImageFrameClass,
} from '@components/DifferenceImageMarker';
import type { SpotMarker } from '@components/DifferenceImageMarker';
import OnlineGameController from '@controllers/onlineGame';
import type { OnlineGameLevel } from '@helpers/types/backend';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Switch, Typography, Upload } from 'antd';
import { useRef, useState, type MutableRefObject } from 'react';

export interface OnlineLevelModalProps {
  open: boolean;
  initial: OnlineGameLevel | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}

export interface OnlineLevelFormValues extends Omit<OnlineGameLevel, 'id' | 'updatedAt'> {
  id?: string;
}

const { Text } = Typography;

function LevelImagePreview({
  src,
  label,
}: {
  src: string | null;
  label: string;
}) {
  if (!src) return null;
  return (
    <div className="space-y-2">
      <Text type="secondary" className="block text-xs">
        {label}
      </Text>
      <div className={differenceImageFrameClass}>
        <img src={src} alt={label} className={differenceImageClass} />
      </div>
    </div>
  );
}

export default function OnlineLevelModal({
  open,
  initial,
  nextOrder,
  onClose,
  onSaved,
}: OnlineLevelModalProps) {
  const [form] = Form.useForm<OnlineLevelFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [differencesFile, setDifferencesFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [playfieldPreview, setPlayfieldPreview] = useState<string | null>(null);
  const [markers, setMarkers] = useState<SpotMarker[]>([]);
  const referenceBlobRef = useRef<string | null>(null);
  const playfieldBlobRef = useRef<string | null>(null);

  const revokeBlob = (ref: MutableRefObject<string | null>) => {
    if (ref.current) {
      URL.revokeObjectURL(ref.current);
      ref.current = null;
    }
  };

  const setReferenceFile = (file: File | null) => {
    revokeBlob(referenceBlobRef);
    setOriginalFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      referenceBlobRef.current = url;
      setReferencePreview(url);
    } else {
      setReferencePreview(initial?.referenceUri ?? null);
    }
  };

  const setPlayfieldFile = (file: File | null) => {
    revokeBlob(playfieldBlobRef);
    setDifferencesFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      playfieldBlobRef.current = url;
      setPlayfieldPreview(url);
      setMarkers([]);
    } else {
      setPlayfieldPreview(initial?.imageUri ?? null);
    }
  };

  const syncFormWhenOpened = (visible: boolean) => {
    if (!visible) {
      revokeBlob(referenceBlobRef);
      revokeBlob(playfieldBlobRef);
      setOriginalFile(null);
      setDifferencesFile(null);
      return;
    }
    setOriginalFile(null);
    setDifferencesFile(null);
    revokeBlob(referenceBlobRef);
    revokeBlob(playfieldBlobRef);
    const row = initial;
    if (row) {
      form.setFieldsValue({ ...row });
      setMarkers(row.differences?.length ? row.differences.map((d) => ({ ...d })) : []);
      setReferencePreview(row.referenceUri);
      setPlayfieldPreview(row.imageUri);
    } else {
      form.resetFields();
      form.setFieldsValue({
        order: nextOrder,
        name: `Online ${nextOrder}`,
        timeLimitSec: 60,
        active: true,
        imageUri: '',
        referenceUri: '',
      });
      setMarkers([]);
      setReferencePreview(null);
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

    const normalized = markers.map((m) => ({
      id: m.id,
      x: m.x,
      y: m.y,
    }));

    const isEdit = Boolean(initial);
    if (!isEdit && (!originalFile || !differencesFile)) {
      Modal.warning({
        title: 'Two images required',
        content: 'Upload the original image and the image with differences separately.',
      });
      return;
    }

    const imageUri = String(values.imageUri ?? '').trim();
    const referenceUri = String(values.referenceUri ?? '').trim();

    setSubmitting(true);
    try {
      if (initial) {
        if (!originalFile && !differencesFile && (!imageUri || !referenceUri)) {
          Modal.warning({
            title: 'Images missing',
            content: 'This round needs both stored images. Upload replacements for original and/or playfield.',
          });
          setSubmitting(false);
          return;
        }
        const ok = await OnlineGameController.update(
          initial.id,
          {
            order: values.order,
            name: values.name,
            imageUri,
            referenceUri,
            differences: normalized,
            timeLimitSec: values.timeLimitSec,
            active: values.active,
          },
          { original: originalFile ?? undefined, differences: differencesFile ?? undefined }
        );
        if (ok) {
          onSaved();
          onClose();
        }
      } else {
        const id = await OnlineGameController.create(
          {
            order: values.order,
            name: values.name,
            imageUri,
            referenceUri,
            differences: normalized,
            timeLimitSec: values.timeLimitSec,
            active: values.active ?? true,
          },
          { original: originalFile ?? undefined, differences: differencesFile ?? undefined }
        );
        if (id) {
          onSaved();
          onClose();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={initial ? `Edit: ${initial.name}` : 'New online round'}
      open={open}
      afterOpenChange={syncFormWhenOpened}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      width={800}
      destroyOnClose
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
    >
      <Text type="secondary" className="mb-4 block text-sm">
        Upload <strong>original</strong> and <strong>with-differences</strong> images, then click the playfield to place
        spots. Storage: <code className="rounded bg-slate-100 px-1">online-game/&lt;id&gt;/original</code> and{' '}
        <code className="rounded bg-slate-100 px-1">differences</code>.
      </Text>
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item name="order" label="Sort order" rules={[{ required: true }]}>
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {(referencePreview || playfieldPreview) && (
          <div className="mb-4 space-y-4">
            <LevelImagePreview
              src={referencePreview}
              label="Original (reference)"
            />
            <LevelImagePreview
              src={playfieldPreview}
              label="With differences (playfield)"
            />
          </div>
        )}

        <Form.Item label="Original image (reference)" required={!initial}>
          <Upload
            maxCount={1}
            accept="image/*"
            beforeUpload={(f) => {
              setReferenceFile(f);
              return false;
            }}
            onRemove={() => setReferenceFile(null)}
          >
            <Button icon={<UploadOutlined />}>
              {referencePreview ? 'Replace original…' : 'Upload original…'}
            </Button>
          </Upload>
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
              {playfieldPreview ? 'Replace playfield…' : 'Upload with differences…'}
            </Button>
          </Upload>
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

        <Form.Item name="timeLimitSec" label="Time limit (sec)" rules={[{ required: true }]}>
          <InputNumber min={5} max={600} className="w-full" />
        </Form.Item>
        <Form.Item name="active" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
