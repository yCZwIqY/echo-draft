import DnSlider from '~/components/common/slider/dn-slider';
import { useState } from 'react';
import { DnRangeSlider } from '~/components/common/slider';
import { DnChipGroup } from '~/components/common/chip-group';
import DnButton from '~/components/common/buttons/dn-button';
import { RxDoubleArrowDown } from 'react-icons/rx';
import { generateComments } from '~/lib/electron/comment-api';

const EXPERTISE_LABEL: Record<number, string> = {
  0: '입문 독자',
  20: '가벼운 독자',
  40: '꾸준한 독자',
  60: '깊이 읽는 독자',
  80: '창작 경험자',
  100: '편집 전문가',
};

const EXPERTISE_STEPS = Object.entries(EXPERTISE_LABEL).map(([value, label]) => ({
  value: Number(value),
  label,
}));

const AGE_STEPS = Array.from({ length: 8 }, (_, index) => (index + 1) * 10);
const COMMENT_COUNT_OPTIONS = [
  { label: '5개', value: 5 },
  { label: '10개', value: 10 },
  { label: '30개', value: 30 },
  { label: '50개', value: 50 },
];

interface Props {
  documentPath: string;
  onGenerated?: (comments: GeneratedComment[]) => void;
}

const GenerateComment = ({ documentPath, onGenerated }: Props) => {
  const [startAge, setStartAge] = useState<number>(10);
  const [endAge, setEndAge] = useState<number>(20);
  const [expertise, setExpertise] = useState<number>(0);
  const [gender, setGender] = useState(50);
  const [count, setCount] = useState(10);

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState<boolean>(false);

  const handleGenerate = async () => {
    setLoading(true);
    const comments = await generateComments({
      documentPath,
      startAge,
      endAge,
      expertise,
      gender,
      count,
    });

    onGenerated?.(comments);
    setLoading(false);
  };

  return (
    <div className={'rounded-xl border border-stone-200 bg-white/90 p-6 shadow-sm'}>
      <div
        className={'mb-6 flex items-center justify-between gap-4 border-b border-stone-100 pb-4'}
      >
        <div>
          <div className={'typo-b3-b text-stone-900'}>댓글 페르소나 설정</div>
          <div className={'mt-1 typo-b5-r text-stone-400'}>
            원고 내용을 기준으로 독자 반응 댓글을 생성합니다.
          </div>
        </div>
        <DnButton
          className={''}
          variant={'outlined'}
          loading={loading}
          onClick={handleGenerate}
        >
          댓글 생성
        </DnButton>
      </div>
      <div
        className={`flex flex-col gap-6 overflow-hidden transition-all ${open ? 'h-[480px]' : 'h-0'}`}
      >
        <div className={'flex flex-col gap-3 px-2'}>
          <div className={'flex items-center justify-between gap-3'}>
            <div>
              <div className={'typo-b4-b text-stone-900'}>연령대</div>
              <div className={'typo-b6-r text-stone-400'}>댓글을 남길 독자의 나이 범위</div>
            </div>
            <div className={'typo-b5-b text-primary-500'}>
              {startAge}대 ~ {endAge}대
            </div>
          </div>
          <DnRangeSlider
            minValue={10}
            maxValue={80}
            value={[startAge, endAge]}
            onChange={([startAge, endAge]) => {
              setStartAge(startAge);
              setEndAge(endAge);
            }}
            step={10}
          />
          <div className={'grid grid-cols-8 gap-1 text-[11px] leading-snug text-stone-400'}>
            {AGE_STEPS.map((age) => (
              <div
                key={age}
                className={`${age >= startAge && age <= endAge ? 'font-bold text-primary-500' : ''} text-center`}
              >
                {age}대
              </div>
            ))}
          </div>
        </div>

        <div className={'flex flex-col gap-3 px-2'}>
          <div className={'flex items-center justify-between gap-3'}>
            <div>
              <div className={'typo-b4-b text-stone-900'}>전문성</div>
              <div className={'typo-b6-r text-stone-400'}>소설을 읽고 판단하는 기준의 깊이</div>
            </div>
            <div className={'typo-b5-b text-primary-500'}>{EXPERTISE_LABEL[expertise]}</div>
          </div>
          <DnSlider
            minValue={0}
            maxValue={100}
            value={expertise}
            onChange={setExpertise}
            step={20}
          />
          <div className={'grid grid-cols-6 gap-1 text-[11px] leading-snug text-stone-400'}>
            {EXPERTISE_STEPS.map(({ value, label }) => (
              <div
                key={value}
                className={`${value === expertise ? 'font-bold text-primary-500' : ''} text-center`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className={'flex flex-col gap-3 px-2'}>
          <div className={'flex items-center justify-between gap-3'}>
            <div>
              <div className={'typo-b4-b text-stone-900'}>성비</div>
              <div className={'typo-b6-r text-stone-400'}>남성 댓글과 여성 댓글의 비율</div>
            </div>
            <div className={'typo-b5-b text-primary-500'}>
              남({gender}):여({100 - gender})
            </div>
          </div>
          <DnSlider
            minValue={0}
            maxValue={100}
            value={gender}
            onChange={setGender}
            step={5}
          />
        </div>

        <div className={'flex flex-col gap-3 px-2'}>
          <div className={'flex items-center justify-between gap-3'}>
            <div>
              <div className={'typo-b4-b text-stone-900'}>개수</div>
              <div className={'typo-b6-r text-stone-400'}>생성할 댓글 수</div>
            </div>
            <div className={'typo-b5-b text-primary-600'}>{count}개</div>
          </div>
          <DnChipGroup
            options={COMMENT_COUNT_OPTIONS}
            value={count}
            onChange={setCount}
          />
        </div>
      </div>
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`${open ? 'rotate-180' : ''} transition-all w-full flex justify-center`}
        >
          <RxDoubleArrowDown />
        </button>
      </div>
    </div>
  );
};

export default GenerateComment;
