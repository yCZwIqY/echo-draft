interface Props {
  tree: WorkspaceNode[];
}
const WorkspaceList = ({ tree }: Props) => {
  const colgroup = <colgroup></colgroup>;
  return (
    <div>
      <table className={'flex'}>
        {colgroup}
        <thead>
          <tr>
            <th>제목</th>
            <th>경로</th>
            <th>수정일</th>
            <th>글자수(공백 포함)</th>
            <th>글자수(공백 미포함)</th>
          </tr>
        </thead>
      </table>
      <table>
        {colgroup}
        <tbody>
          {tree.map((item, index) => (
            <tr key={item.path}>
              <td>{item.name.split('.')[0]}</td>
              <td>{item.path.split('.')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkspaceList;
