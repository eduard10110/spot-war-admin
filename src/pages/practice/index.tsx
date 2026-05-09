import Loader from "@components/loader";
import PracticeConfigController from "@controllers/practiceConfig";
import type {
  LevelProgressionModalState,
  PracticeLevelModalState,
} from "@helpers/types/admin";
import type {
  LevelProgressionBand,
  PracticeGameplayConfig,
  PracticeLevelCatalog,
} from "@helpers/types/backend";
import LevelProgressionModal from "@modals/LevelProgressionModal";
import PracticeLevelModal from "@modals/PracticeLevelModal";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Image,
  InputNumber,
  Popover,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const { Title } = Typography;

const diffColor: Record<PracticeLevelCatalog["difficulty"], string> = {
  easy: "green",
  medium: "orange",
  hard: "red",
};

export default function Practice() {
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<PracticeLevelCatalog[]>([]);
  const [bands, setBands] = useState<LevelProgressionBand[]>([]);
  const [gameplayConfig, setGameplayConfig] = useState<PracticeGameplayConfig>({
    hintCoinCost: 100,
    maxWrongTaps: 3,
  });
  const [savingGameplayConfig, setSavingGameplayConfig] = useState(false);

  const [levelModal, setLevelModal] = useState<PracticeLevelModalState>({
    open: false,
    row: null,
  });
  const [bandModal, setBandModal] = useState<LevelProgressionModalState>({
    open: false,
    row: null,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    const [l, b, gameplay] = await Promise.all([
      PracticeConfigController.listPracticeLevels(),
      PracticeConfigController.listLevelProgression(),
      PracticeConfigController.getPracticeGameplayConfig(),
    ]);
    setLevels(l);
    setBands(b);
    setGameplayConfig(gameplay);
    setLoading(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      void refresh();
    });
  }, [refresh]);

  const levelColumns = useMemo(
    () => [
      {
        title: "Lv",
        dataIndex: "level" as const,
        width: 64,
        sorter: (a: PracticeLevelCatalog, b: PracticeLevelCatalog) =>
          a.level - b.level,
      },
      { title: "Name", dataIndex: "name" as const, ellipsis: true },
      {
        title: "Original",
        dataIndex: "referenceUri" as const,
        width: 100,
        render: (uri: string) => (
          <Popover content={<Image src={uri} width={280} alt="" />}>
            <img
              src={uri}
              alt=""
              className="h-12 w-20 rounded object-cover"
              title="Original"
            />
          </Popover>
        ),
      },
      {
        title: "With differences",
        dataIndex: "imageUri" as const,
        width: 120,
        render: (uri: string) => (
          <Popover content={<Image src={uri} width={280} alt="" />}>
            <img
              src={uri}
              alt=""
              className="h-12 w-20 rounded object-cover"
              title="Playfield"
            />
          </Popover>
        ),
      },
      {
        title: "Difficulty",
        dataIndex: "difficulty" as const,
        width: 110,
        render: (d: PracticeLevelCatalog["difficulty"]) => (
          <Tag color={diffColor[d]}>{d}</Tag>
        ),
      },
      { title: "Time (s)", dataIndex: "timeLimitSec" as const, width: 96 },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        render: (_: unknown, row: PracticeLevelCatalog) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setLevelModal({ open: true, row })}
            />
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                void (async () => {
                  const ok = await PracticeConfigController.deletePracticeLevel(
                    row.level,
                  );
                  if (ok) void refresh();
                })();
              }}
            />
          </Space>
        ),
      },
    ],
    [refresh],
  );

  const bandColumns = useMemo(
    () => [
      { title: "Lv", dataIndex: "level" as const, width: 64 },
      { title: "Min XP", dataIndex: "minXp" as const },
      { title: "Max XP", dataIndex: "maxXp" as const },
      { title: "Title", dataIndex: "title" as const },
      { title: "Coins", dataIndex: "rewardCoins" as const, width: 88 },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        render: (_: unknown, row: LevelProgressionBand) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setBandModal({ open: true, row })}
            />
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                void (async () => {
                  const ok =
                    await PracticeConfigController.deleteLevelProgression(
                      row.level,
                    );
                  if (ok) void refresh();
                })();
              }}
            />
          </Space>
        ),
      },
    ],
    [refresh],
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-[480px]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Title level={3} className="mb-0!">
          Practice configuration
        </Title>
      </div>
      <Card title="Practice gameplay rules" className="mb-4">
        <Space wrap size={16}>
          <div>
            <div className="mb-1 text-xs text-gray-500">Hint coin cost</div>
            <InputNumber
              min={1}
              value={gameplayConfig.hintCoinCost}
              onChange={(value) =>
                setGameplayConfig((prev) => ({
                  ...prev,
                  hintCoinCost: Number(value) || 1,
                }))
              }
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-gray-500">
              Max wrong taps (game over)
            </div>
            <InputNumber
              min={1}
              value={gameplayConfig.maxWrongTaps}
              onChange={(value) =>
                setGameplayConfig((prev) => ({
                  ...prev,
                  maxWrongTaps: Number(value) || 1,
                }))
              }
            />
          </div>
          <Button
            type="primary"
            loading={savingGameplayConfig}
            onClick={() => {
              void (async () => {
                setSavingGameplayConfig(true);
                try {
                  const ok =
                    await PracticeConfigController.upsertPracticeGameplayConfig(
                      gameplayConfig,
                    );
                  if (ok) await refresh();
                } finally {
                  setSavingGameplayConfig(false);
                }
              })();
            }}
          >
            Save rules
          </Button>
        </Space>
      </Card>

      <Tabs
        items={[
          {
            key: "levels",
            label: "Practice levels",
            children: (
              <>
                <div className="mb-3">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setLevelModal({ open: true, row: null })}
                  >
                    Add level
                  </Button>
                </div>
                <Table<PracticeLevelCatalog>
                  rowKey={(r) => String(r.level)}
                  dataSource={levels}
                  columns={levelColumns}
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: true }}
                />
              </>
            ),
          },
          {
            key: "progression",
            label: "XP progression",
            children: (
              <>
                <div className="mb-3">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setBandModal({ open: true, row: null })}
                  >
                    Add band
                  </Button>
                </div>
                <Table<LevelProgressionBand>
                  rowKey={(r) => String(r.level)}
                  dataSource={bands}
                  columns={bandColumns}
                  pagination={{ pageSize: 50 }}
                  scroll={{ x: true }}
                />
              </>
            ),
          },
        ]}
      />

      <PracticeLevelModal
        open={levelModal.open}
        initial={levelModal.row}
        onClose={() => setLevelModal({ open: false, row: null })}
        onSaved={refresh}
      />
      <LevelProgressionModal
        open={bandModal.open}
        initial={bandModal.row}
        onClose={() => setBandModal({ open: false, row: null })}
        onSaved={refresh}
      />
    </div>
  );
}
