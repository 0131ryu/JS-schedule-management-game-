const indexDao = require("../dao/indexDao");

exports.createdTodo = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  const { contents, type } = req.body;

  if (!userIdx || !contents || !type) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: "입력 값이 누락됬습니다.",
    });
  }

  //contentss 20자 초과 불가
  if (contents.length > 20) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: "콘텐츠는 20글자 이내로 설정하세요",
    });
  }

  //type: do, decide, delete, delegate
  const validTypes = ["do", "decide", "delete", "delegate"];
  if (!validTypes.includes(type)) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: "유효한 타입이 아닙니다.",
    });
  }

  const insertTodoRow = await indexDao.insertTodo(userIdx, contents, type);

  if (!insertTodoRow) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: "요청에 실패했습니다. 관리자에게 문의하세요.",
    });
  }

  return res.send({
    isSuccess: true,
    code: 200,
    message: "일정 생성 성공.",
  });

  console.log(insertTodoRow);
};

exports.readTodo = async function (req, res) {
  const { userIdx } = req.params;

  const todos = {};
  const types = ["do", "decide", "delegate", "delete"];

  for (let type of types) {
    let selectTodoByTypeRows = await indexDao.selectTodoByType(userIdx, type);

    if (!selectTodoByTypeRows) {
      return res.send({
        isSuccess: true,
        code: 400,
        message: "일정 조회 실패, 관리자에게 문의주세요",
      });
    }

    todos[type] = selectTodoByTypeRows;
  }

  return res.send({
    result: todos,
    isSuccess: true,
    code: 400,
    message: "일정 조회 성공",
  });
};

exports.updateTodo = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  let { todoIdx, contents, status } = req.body;

  if (!userIdx || !todoIdx) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: "userIdx, todoIdx를 보내주세요",
    });
  }

  if (!contents) {
    contents = null;
  }

  if (!status) {
    status = null;
  }

  const inValidTodoRow = await indexDao.selectValidTodo(userIdx, todoIdx);

  if (!inValidTodoRow.length < 1) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: `유효한 요청이 아닙니다. userIdx, todoIdx를 확인하세요`,
    });
  }
  //console.log(inValidTodoRow);
  const updateTodoRow = await indexDao.updateTodo(
    userIdx,
    todoIdx,
    contents,
    status
  );
  console.log(updateTodoRow);
};

exports.deleteTodo = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  const { todoIdx } = req.params;

  if (!userIdx || !todoIdx) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: "userIdx, todoIdx를 입력해주세요",
    });
  }

  const inValidTodoRow = await indexDao.selectValidTodo(userIdx, todoIdx);

  if (!inValidTodoRow.length < 1) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: `유효한 요청이 아닙니다.(delete) userIdx, todoIdx를 확인하세요`,
    });
  }

  const updateTodoRow = await indexDao.updateTodo(
    userIdx,
    todoIdx,
    contents,
    status
  );
  if (!updateTodoRow) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: "관리자에게 문의하세요",
    });
  }

  const deleteTodoRow = await indexDao.deleteTodo(userIdx, todoIdx);

  if (!deleteTodoRow) {
    return res.send({
      isSuccess: false,
      code: 400,
      message: "삭제 실패, 관리자에게 문의하세요",
    });
  }
  return res.send({
    isSuccess: true,
    code: 200,
    message: "삭제 성공",
  });
};
