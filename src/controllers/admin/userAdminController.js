const roles = require('../../constants/roles');
const userService = require('../../services/userService');

const roleLabels = {
  [roles.admin]: 'admin',
  [roles.shop]: 'shop',
  [roles.sale]: 'sale',
  [roles.user]: 'user',
};

const statusLabels = {
  active: '啟用',
  inactive: '停用',
};

function isDuplicateAccountError(err) {
  return err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062);
}

function readBody(body) {
  return {
    account: String(body.account || '').trim(),
    role: userService.normalizeRole(body.role),
    displayName: String(body.display_name || '').trim(),
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim(),
    status: body.status === 'inactive' ? 'inactive' : 'active',
    password: String(body.password || ''),
  };
}

function validatePayload(payload, { passwordRequired }) {
  if (!payload.account) return '請輸入帳號';
  if (payload.account.length > 80) return '帳號長度不可超過 80 個字';
  if (passwordRequired && !payload.password) return '請輸入密碼';
  if (payload.password && payload.password.length < 6) return '密碼至少需要 6 個字';
  return '';
}

function formViewData({ mode, title, userRecord, values, error }) {
  return {
    view: 'users/form',
    title,
    resourceSlug: 'users',
    mode,
    userRecord,
    values:
      values ||
      {
        account: userRecord ? userRecord.account : '',
        role: userRecord ? userRecord.role : roles.user,
        display_name: userRecord ? userRecord.display_name : '',
        email: userRecord ? userRecord.email : '',
        phone: userRecord ? userRecord.phone : '',
        status: userRecord ? userRecord.status : 'active',
      },
    roles: userService.ROLE_VALUES,
    roleLabels,
    statusLabels,
    error: error || '',
  };
}

async function list(req, res, next) {
  try {
    const users = await userService.listUsers();
    return res.render('admin/layout', {
      view: 'users/list',
      title: '帳號管理',
      resourceSlug: 'users',
      users,
      roleLabels,
      statusLabels,
      saved: req.query.saved,
    });
  } catch (err) {
    return next(err);
  }
}

function renderNew(req, res) {
  return res.render(
    'admin/layout',
    formViewData({
      mode: 'new',
      title: '新增帳號',
      userRecord: null,
    })
  );
}

async function create(req, res, next) {
  const payload = readBody(req.body);
  const error = validatePayload(payload, { passwordRequired: true });
  const values = {
    account: payload.account,
    role: payload.role,
    display_name: payload.displayName,
    email: payload.email,
    phone: payload.phone,
    status: payload.status,
  };

  if (error) {
    return res.status(400).render(
      'admin/layout',
      formViewData({
        mode: 'new',
        title: '新增帳號',
        userRecord: null,
        values,
        error,
      })
    );
  }

  try {
    await userService.createUser(payload);
    return res.redirect('/admin/users?saved=1');
  } catch (err) {
    if (isDuplicateAccountError(err)) {
      return res.status(409).render(
        'admin/layout',
        formViewData({
          mode: 'new',
          title: '新增帳號',
          userRecord: null,
          values,
          error: '此帳號已存在',
        })
      );
    }
    return next(err);
  }
}

async function renderEdit(req, res, next) {
  try {
    const userRecord = await userService.findById(req.params.id);
    if (!userRecord) {
      const err = new Error('找不到帳號');
      err.status = 404;
      throw err;
    }
    return res.render(
      'admin/layout',
      formViewData({
        mode: 'edit',
        title: '編輯帳號',
        userRecord,
      })
    );
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  const id = Number(req.params.id);
  const payload = readBody(req.body);
  const error = validatePayload(payload, { passwordRequired: false });
  const values = {
    account: payload.account,
    role: payload.role,
    display_name: payload.displayName,
    email: payload.email,
    phone: payload.phone,
    status: payload.status,
  };

  try {
    const userRecord = await userService.findById(id);
    if (!userRecord) {
      const err = new Error('找不到帳號');
      err.status = 404;
      throw err;
    }

    const isSelf = req.currentUser && Number(req.currentUser.id) === id;
    const selfLockout = isSelf && (payload.role !== roles.admin || payload.status !== 'active');
    const finalError = error || (selfLockout ? '不可停用自己或移除自己的 admin 角色' : '');

    if (finalError) {
      return res.status(400).render(
        'admin/layout',
        formViewData({
          mode: 'edit',
          title: '編輯帳號',
          userRecord,
          values,
          error: finalError,
        })
      );
    }

    await userService.updateUser(id, payload);
    return res.redirect('/admin/users?saved=1');
  } catch (err) {
    if (isDuplicateAccountError(err)) {
      const userRecord = await userService.findById(id);
      return res.status(409).render(
        'admin/layout',
        formViewData({
          mode: 'edit',
          title: '編輯帳號',
          userRecord,
          values,
          error: '此帳號已存在',
        })
      );
    }
    return next(err);
  }
}

async function destroy(req, res, next) {
  const id = Number(req.params.id);
  try {
    if (req.currentUser && Number(req.currentUser.id) === id) {
      const err = new Error('不可刪除自己的帳號');
      err.status = 400;
      throw err;
    }
    await userService.deleteUser(id);
    return res.redirect('/admin/users?saved=1');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  destroy,
  list,
  renderEdit,
  renderNew,
  update,
};
