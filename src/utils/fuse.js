import Fuse from 'fuse.js';

const fuseTest = (req, res, next) => {
  const { patterns } = req.query;

  const nameFuse = new Fuse(products, {
    /** 일치 항목을 결과 집합에 포함할지 여부입니다. true이면 결과 집합의 각 레코드에 일치하는 문자의 인덱스가 포함됩니다. 이들은 결과적으로 강조 목적으로 사용될 수 있다. */
    includeMatches: false,
    includeScore: true,
    /** 검색할 키 목록입니다. 이는 중첩된 경로, 가중치 검색, '문자열' 및 '개체' */
    keys: [NAME],
    /** 길이가 이 값을 초과하는 일치 항목만 반환됩니다. 예를 들어, 결과에서 단일 문자 일치 항목을 무시하려면 "2"로 설정하십시오. */
    minMatchCharLength: 2,
    /** 점수별로 결과 목록을 정렬할지 여부입니다. */
    shouldSort: true,
    /** true이면 unix와 같은 검색 명령어를 사용할 수 있다. [example](/example.html#extended-search)를 참조하십시오. */
    useExtendedSearch: false,
  });

  const targetProducts =
    patterns ||
    `Peridot Ring (탄생석반지) WHITE/Sx2
  Peridot Ring (탄생석반지) BLACK/Lx2
Peridot String Bracelet (탄생석끈팔찌) BLACK/Sx2
Real Heart Ring (하트통통반지) BLACK/Sx2
Castle Bold Ring (캐슬반지) BLACK/Sx2
Carve ring (각인반지) BLACK/Sx2
Loop Earcuff Silver (루프이어커프) BLACK/Lx2`
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const splitedLine = line.split(' ');
        const detailTextIndex = splitedLine.findIndex(text => text.includes('/') && text.includes('x'));
        const detailText = splitedLine[detailTextIndex];
        const [optionsText, amount] = detailText.split('x');
        const optionPatterns = optionsText.split('/').sort((a, b) => b.length - a.length);

        return {
          item: nameFuse.search(splitedLine.slice(0, detailTextIndex).join(' '))[0].item,
          amount,
          optionPatterns,
        };
      });

  const { price, combinedProducts } = targetProducts.reduce(
    (acc, { item: { [NAME]: productName, [PRICE]: basePrice, [OPTIONS]: productOptions }, amount, optionPatterns }) => {
      const optionsFuse = new Fuse(productOptions, {
        /** 일치 항목을 결과 집합에 포함할지 여부입니다. true이면 결과 집합의 각 레코드에 일치하는 문자의 인덱스가 포함됩니다. 이들은 결과적으로 강조 목적으로 사용될 수 있다. */
        includeMatches: false,
        includeScore: true,
        /** 검색할 키 목록입니다. 이는 중첩된 경로, 가중치 검색, '문자열' 및 '개체' */
        keys: [NAME],
        /** 길이가 이 값을 초과하는 일치 항목만 반환됩니다. 예를 들어, 결과에서 단일 문자 일치 항목을 무시하려면 "2"로 설정하십시오. */
        minMatchCharLength: 2,
        /** 점수별로 결과 목록을 정렬할지 여부입니다. */
        shouldSort: true,
        /** true이면 unix와 같은 검색 명령어를 사용할 수 있다. [example](/example.html#extended-search)를 참조하십시오. */
        useExtendedSearch: false,
      });

      const { optionText, finalPrice } = optionPatterns.reduce(
        (result, option) => {
          const { [NAME]: optionName, [PRICE]: optionPrice } = optionsFuse.search(option)[0].item;

          result.optionText.push(optionName);
          result.finalPrice += optionPrice;

          return result;
        },
        {
          optionText: [],
          finalPrice: basePrice,
        },
      );

      acc.combinedProducts[productName] = {
        ...(acc.combinedProducts?.[productName] || { teikeibunn: [], memo: [] }),
        teikeibunn: [
          ...(acc.combinedProducts?.[productName]?.teikeibunn || []),
          `[${optionText.join('/')}(${finalPrice})] x ${amount} = ${finalPrice * amount}`,
        ],
        memo: [...(acc.combinedProducts?.[productName]?.memo || []), `[${optionText.join('/')}] x ${amount}`],
      };
      acc.price += finalPrice * amount;

      return acc;
    },
    {
      price: 0,
      combinedProducts: {},
    },
  );

  const { teikeibunn, memo } = Object.entries(combinedProducts)
    .map(([productName, { teikeibunn, memo }]) => ({
      teikeibunn: `${productName}
${teikeibunn.join('\n')}`,
      memo: `${productName}
${memo.join('\n')}`,
    }))
    .reduce(
      ({ teikeibunn: prevTeikeibunns, memo: prevMemos }, { teikeibunn: currTeikeibunn, memo: currMemo }) => ({
        teikeibunn: [...prevTeikeibunns, currTeikeibunn],
        memo: [...prevMemos, currMemo],
      }),
      { teikeibunn: [], memo: [] },
    );

  res.send({ teikeibunn: [...teikeibunn, price].join('\n\n'), memo: memo.join('\n\n') });
};
