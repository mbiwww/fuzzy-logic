import AdminLayout from '../components/admin/AdminLayout'
import AdminDrinksPage from './admin/AdminDrinksPage'
import AdminDrinkFormPage from './admin/AdminDrinkFormPage'
import AdminSettingsPage from './admin/AdminSettingsPage'
import { navigate } from '../lib/useHashRoute'

// Rute admin:
//   #/admin                 daftar minuman
//   #/admin/tambah          form tambah
//   #/admin/edit/<id>       form edit
//   #/admin/pengaturan      pengaturan penilaian
export default function AdminPage({
  path,
  drinks,
  ranked,
  settings,
  onSaveDrink,
  onDeleteDrink,
  onSaveSettings,
  onLogout,
}) {
  const editMatch = path.match(/^\/admin\/edit\/(\d+)$/)
  const editing = editMatch ? drinks.find((d) => d.id === Number(editMatch[1])) : null

  let active = 'minuman'
  let content

  if (path === '/admin/pengaturan') {
    active = 'pengaturan'
    content = <AdminSettingsPage settings={settings} onSave={onSaveSettings} />
  } else if (path === '/admin/tambah' || editMatch) {
    content = (
      <AdminDrinkFormPage
        key={editing ? `edit-${editing.id}` : 'tambah'}
        drink={editing}
        notFound={Boolean(editMatch) && !editing}
        settings={settings}
        onSave={(values) => {
          onSaveDrink(values, editing ? editing.id : null)
          navigate('#/admin')
        }}
        onCancel={() => navigate('#/admin')}
      />
    )
  } else {
    content = <AdminDrinksPage ranked={ranked} onDelete={onDeleteDrink} />
  }

  return (
    <AdminLayout active={active} onLogout={onLogout}>
      {content}
    </AdminLayout>
  )
}
