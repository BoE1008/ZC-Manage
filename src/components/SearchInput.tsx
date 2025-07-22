import { Input } from "antd";
import { useCallback, useMemo } from "react";
import { debounce } from "radash";

const SearchInput = ({
  onSearch,
  placeholder,
}: {
  onSearch: (val: string) => void;
  placeholder: string;
}) => {
  // 用 useCallback + debounce 确保只生成一次函数
  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        onSearch(val);
      }, 500),
    [onSearch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  return <Input placeholder={placeholder} allowClear onChange={handleChange} />;
};

export default SearchInput;
