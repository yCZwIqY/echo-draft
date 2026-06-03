import { useEffect, useState } from 'react';

import {
  getSettingInfo,
  updateSelectedEmbeddingModel,
  updateSelectedLLMModel,
} from '~/lib/electron/setting-api';
import { getOllamaModels, getOllamaRunning, type OllamaModel } from '~/lib/ollama-api';
import { DnSelect } from '~/components/common/selector';

function getModelName(model: OllamaModel) {
  return model.model || model.name;
}

function formatModelSize(size?: number) {
  if (!size) {
    return undefined;
  }

  const gib = size / 1024 / 1024 / 1024;
  return `${gib.toFixed(gib >= 10 ? 0 : 1)}GB`;
}

function toModelOption(model: OllamaModel) {
  const modelName = getModelName(model);
  const size = formatModelSize(model.size);

  return {
    description: [model.details?.parameter_size, model.details?.quantization_level, size]
      .filter(Boolean)
      .join(' · '),
    label: modelName,
    value: modelName,
  };
}

const AiSetting = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [embeddingModels, setEmbeddingModels] = useState<OllamaModel[]>([]);
  const [llmModels, setLlmModels] = useState<OllamaModel[]>([]);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState<string | null>(null);
  const [selectedLLMModel, setSelectedLLMModel] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);

      const nextIsRunning = await getOllamaRunning();
      setIsRunning(nextIsRunning);

      if (!nextIsRunning) {
        setEmbeddingModels([]);
        setLlmModels([]);
        setSelectedEmbeddingModel(null);
        setSelectedLLMModel(null);
        return;
      }

      const [modelResponse, settingInfo] = await Promise.all([getOllamaModels(), getSettingInfo()]);
      const nextEmbeddingModels = modelResponse.models.filter((model) =>
        model.capabilities.includes('embedding'),
      );
      const nextLlmModels = modelResponse.models.filter((model) =>
        model.capabilities.includes('completion'),
      );
      const nextEmbeddingNames = new Set(nextEmbeddingModels.map(getModelName));
      const nextLlmNames = new Set(nextLlmModels.map(getModelName));
      const nextSelectedEmbeddingModel =
        settingInfo.selectedEmbeddingModel &&
        nextEmbeddingNames.has(settingInfo.selectedEmbeddingModel)
          ? settingInfo.selectedEmbeddingModel
          : nextEmbeddingModels[0]
            ? getModelName(nextEmbeddingModels[0])
            : null;
      const nextSelectedLLMModel =
        settingInfo.selectedLLMModel && nextLlmNames.has(settingInfo.selectedLLMModel)
          ? settingInfo.selectedLLMModel
          : nextLlmModels[0]
            ? getModelName(nextLlmModels[0])
            : null;

      setEmbeddingModels(nextEmbeddingModels);
      setLlmModels(nextLlmModels);
      setSelectedEmbeddingModel(nextSelectedEmbeddingModel);
      setSelectedLLMModel(nextSelectedLLMModel);

      if (nextSelectedEmbeddingModel !== settingInfo.selectedEmbeddingModel) {
        await updateSelectedEmbeddingModel(nextSelectedEmbeddingModel);
      }

      if (nextSelectedLLMModel !== settingInfo.selectedLLMModel) {
        await updateSelectedLLMModel(nextSelectedLLMModel);
      }
    };

    void loadModels()
      .catch(() => {
        setIsRunning(false);
        setEmbeddingModels([]);
        setLlmModels([]);
        setSelectedEmbeddingModel(null);
        setSelectedLLMModel(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleEmbeddingModelChange = async (value: string) => {
    const nextValue = value || null;
    setSelectedEmbeddingModel(nextValue);
    await updateSelectedEmbeddingModel(nextValue);
  };

  const handleLLMModelChange = async (value: string) => {
    const nextValue = value || null;
    setSelectedLLMModel(nextValue);
    await updateSelectedLLMModel(nextValue);
  };

  return (
    <section className={'w-full rounded-lg bg-white shadow-md'}>
      <div
        className={'flex items-start justify-between gap-4 border-b border-neutral-200 px-4 py-3'}
      >
        <div>
          <div className={'text-sm font-bold text-neutral-600'}>AI 모델 설정</div>
          <p className={'mt-1 text-xs text-neutral-400'}>임베딩 및 생성형 llm 모델을 선택합니다.</p>
        </div>
      </div>
      <div className={'p-4'}>
        {!isRunning && (
          <div className='mb-3'>
            <div className='font-medium text-neutral-900'>Ollama를 찾을 수 없습니다.</div>
            <p className='mt-1'>
              로컬 AI 기능을 사용하려면 Ollama를 설치한 뒤 앱을 다시 실행해주세요.
            </p>
            <a
              className='mt-3 inline-flex font-medium text-blue-600 hover:text-blue-700'
              href='https://ollama.com/download'
              rel='noreferrer'
              target='_blank'
            >
              Ollama 다운로드
            </a>
          </div>
        )}

        {isRunning && (
          <div className='space-y-4'>
            {isLoading && <div className='py-1'>모델 목록을 불러오는 중입니다.</div>}

            {!isLoading && embeddingModels.length === 0 && llmModels.length === 0 && (
              <div className='py-1'>모델을 찾을 수 없습니다. Ollama에서 모델을 설치해주세요.</div>
            )}

            <DnSelect
              disabled={embeddingModels.length === 0}
              emptyLabel='사용 가능한 임베딩 모델 없음'
              hint='문서 검색과 의미 기반 매칭에 사용할 모델입니다.'
              label='임베딩 모델'
              onChange={(value) => void handleEmbeddingModelChange(value)}
              options={embeddingModels.map(toModelOption)}
              value={selectedEmbeddingModel ?? ''}
            />

            <DnSelect
              disabled={llmModels.length === 0}
              emptyLabel='사용 가능한 LLM 모델 없음'
              hint='요약, 생성, 대화형 작업에 사용할 모델입니다.'
              label='LLM 모델'
              onChange={(value) => void handleLLMModelChange(value)}
              options={llmModels.map(toModelOption)}
              value={selectedLLMModel ?? ''}
            />
          </div>
        )}

        <div className='mt-4'>
          <div className='font-medium text-neutral-900'>추천 모델</div>
          <ul className='mt-2 space-y-1'>
            <li>
              임베딩:{' '}
              <a
                className='font-medium text-blue-600 hover:text-blue-700'
                href='https://ollama.com/dengcao/Qwen3-Embedding-0.6B'
                rel='noreferrer'
                target='_blank'
              >
                Qwen3-Embedding-0.6B
              </a>
            </li>
            <li>
              LLM:{' '}
              <a
                className='font-medium text-blue-600 hover:text-blue-700'
                href='https://ollama.com/library/exaone3.5'
                rel='noreferrer'
                target='_blank'
              >
                EXAONE3.5
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AiSetting;
