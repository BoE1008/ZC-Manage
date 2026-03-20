import { Input } from "antd";
import { useCallback, useMemo, useRef } from "react";
import { debounce } from "radash";

const SearchInput = ({
  onSearch,
  placeholder,
}: {
  onSearch: (val: string) => void;
  placeholder: string;
}) => {
  // 处理中英文全输入：中文输入法（IME）组合输入期间不要触发搜索
  const isComposingRef = useRef(false);

  // 用 useCallback + debounce 确保只生成一次函数
  const debouncedSearch = useMemo(
    () =>
      debounce({ delay: 1000 }, (val: string) => {
        onSearch(val);
      }),
    [onSearch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (isComposingRef.current) return;
      debouncedSearch(val);
    },
    [debouncedSearch]
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      // 输入法组合结束后，使用最终值触发一次搜索
      debouncedSearch((e.currentTarget as HTMLInputElement).value);
    },
    [debouncedSearch]
  );

  return (
    <Input
      placeholder={placeholder}
      allowClear
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
};

export default SearchInput;
