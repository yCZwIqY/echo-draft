export type DefaultCommentStyleExample = {
  content: string;
  tone: string;
  ageGroup: number | null;
  expertiseLevel: number;
};

const DEFAULT_COMMENT_STYLE_EXAMPLES_JSON = `[
  {
    "content": "아 여기서 끊는 건 진짜 너무하네",
    "tone": "기대",
    "ageGroup": 20,
    "expertiseLevel": 20
  },
  {
    "content": "근데 얘 방금 한 말이랑 앞에서 했던 행동이 좀 안 맞는 듯",
    "tone": "분석",
    "ageGroup": 20,
    "expertiseLevel": 60
  },
  {
    "content": "주인공 답답한데 상황 생각하면 이해는 감",
    "tone": "캐릭터 반응",
    "ageGroup": 20,
    "expertiseLevel": 20
  },
  {
    "content": "이 장면 대사는 좋은데 설명이 살짝 많아서 몰입이 끊김",
    "tone": "분석",
    "ageGroup": 30,
    "expertiseLevel": 80
  },
  {
    "content": "아니 얘 왜 갑자기 이렇게 침착함? 아까 분위기랑 좀 다르지 않나",
    "tone": "의문",
    "ageGroup": 20,
    "expertiseLevel": 40
  },
  {
    "content": "오타 하나 보이는데 그래도 장면 자체는 잘 넘어감",
    "tone": "분석",
    "ageGroup": 30,
    "expertiseLevel": 80
  },
  {
    "content": "이 캐릭터 말투 확실히 매력 있음ㅋㅋ",
    "tone": "캐릭터 반응",
    "ageGroup": 10,
    "expertiseLevel": 20
  },
  {
    "content": "앞에서 죽었다고 나온 인물이면 여기서 멀쩡히 나오는 건 설명이 필요할 듯",
    "tone": "분석",
    "ageGroup": 30,
    "expertiseLevel": 100
  },
  {
    "content": "전개 빠른 건 좋은데 감정선이 한 박자만 더 있었으면 좋겠음",
    "tone": "아쉬움",
    "ageGroup": 30,
    "expertiseLevel": 80
  },
  {
    "content": "와 이건 다음 화 바로 봐야 되는 흐름인데",
    "tone": "기대",
    "ageGroup": 20,
    "expertiseLevel": 20
  },
  {
    "content": "대사가 좀 작위적인 느낌? 캐릭터가 말한다기보다 설명하는 느낌임",
    "tone": "분석",
    "ageGroup": 30,
    "expertiseLevel": 100
  },
    {
    "content": "가독성 최악이네요. 중학생이 쓴 글 같습니다.",
    "tone": "분석",
    "ageGroup": 20,
    "expertiseLevel": 100
  },
  {
    "content": "여기서 표정 묘사 하나만 더 있었으면 감정이 더 잘 살았을 듯",
    "tone": "아쉬움",
    "ageGroup": 40,
    "expertiseLevel": 80
  },
  {
    "content": "아 얘 뭔가 숨기는 거 같은데 나만 그렇게 느낌?",
    "tone": "추측",
    "ageGroup": 20,
    "expertiseLevel": 20
  },
  {
    "content": "이름이 앞부분이랑 다르게 나온 것 같은데 확인 필요해 보임",
    "tone": "분석",
    "ageGroup": 30,
    "expertiseLevel": 100
  },
  {
    "content": "장면 전환이 갑자기 튀어서 중간에 한 문단 빠진 줄 알았음",
    "tone": "아쉬움",
    "ageGroup": 20,
    "expertiseLevel": 60
  },
  {
    "content": "아니 나였어도 개빡침;; 쟤 완전 보살이네",
    "tone": "몰입",
    "ageGroup": 20,
    "expertiseLevel": 20
  },
  {
    "content": "문장 끝 표현이 반복돼서 리듬이 조금 단조롭게 느껴짐",
    "tone": "분석",
    "ageGroup": 40,
    "expertiseLevel": 100
  },
  {
    "content": "아니야ㅜㅜ 그냥 넘기지마!! 의심 좀 해!!",
    "tone": "의문",
    "ageGroup": 20,
    "expertiseLevel": 40
  },
  {
    "content": "설정은 흥미로운데 이번 화 안에서 근거가 조금 더 필요해 보임",
    "tone": "분석",
    "ageGroup": 30,
    "expertiseLevel": 80
  },
  {
    "content": "ㅋㅋㅋ 이 캐릭터 나오면 분위기 바로 바뀌네",
    "tone": "캐릭터 반응",
    "ageGroup": 10,
    "expertiseLevel": 0
  },
  {
    "content": "갖 -> 같. 오타났네요. 조금 더 꼼꼼히 검수해주시길.",
    "tone": "지적",
    "ageGroup": 30,
    "expertiseLevel": 80
  }
]`;

export function getDefaultCommentStyleExamples() {
  return JSON.parse(DEFAULT_COMMENT_STYLE_EXAMPLES_JSON) as DefaultCommentStyleExample[];
}

