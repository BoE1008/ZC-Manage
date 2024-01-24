export const menuHandler = (data) => {
  return data.map(({ name, url, children }) => ({
    key: url,
    label: name,
    children: children?.map((item) => ({
      key: item.url,
      label: item.name,
    })),
  }));
};

export const formatNumber = (number?: number) => {
  const formattedNumber = number?.toLocaleString();

  return formattedNumber;
};

export const formatMenu = (menu) => {
  return menu.map((c) => {
    return {
      ...c,
      title: c.name,
      key: c.id,
      children: c.children ? formatMenu(c.children) : c.children,
    };
  });
};

export const formatDept = (menu) => {
  return menu.map((c) => {
    return {
      ...c,
      label: c.name,
      value: c.id,
      children: c.children ? formatDept(c.children) : c.children,
    };
  });
};

export const arrayToTree = (arr, parentId: string = "0") =>
  arr
    .filter((item) => item.parentId === parentId)
    .map((item) => {
      const children = arrayToTree(arr, item.id);
      if (children.length > 0) {
        return {
          ...item,
          children,
        };
      } else {
        const { children, ...rest } = item;
        return rest;
      }
    });
