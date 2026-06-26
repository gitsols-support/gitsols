// /admin/activity redirects to the editorial /admin/activities page
import { redirect } from 'next/navigation'

export default function ActivityPage(): never {
  redirect('/admin/activities')
}
