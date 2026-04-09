import API from './axios';

export async function getMyAddresses() {
  const res = await API.get('/api/address/my');
  return res.data;
}

export async function addAddress(data) {
  const res = await API.post('/api/address/add', data);
  return res.data;
}

export async function updateAddress(id, data) {
  const res = await API.patch(`/api/address/update/${id}`, data);
  return res.data;
}

export async function deleteAddress(id) {
  await API.delete(`/api/address/delete/${id}`);
}

export async function setDefaultAddress(id) {
  const res = await API.patch(`/api/address/default/${id}`);
  return res.data;
}