'use server'

import { createAuthClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += c
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n')
  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const values = parseCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, j) => { row[h.trim()] = values[j] ?? '' })
    rows.push(row)
  }
  return rows
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function mapCategory(raw: string): string {
  const part = raw.split('>').pop()?.trim() ?? ''
  const map: Record<string, string> = {
    'Carnicos': 'Cárnicos',
    'Cárnicos': 'Cárnicos',
    'Embutidos': 'Embutidos',
    'Granos': 'Granos',
    'Productos del agro': 'Agro',
    'Bebidas': 'Bebidas',
    'Lácteos': 'Lácteos',
    'Hogar': 'Hogar',
    'Pastas': 'Pastas',
    'Confituras': 'Confituras',
    'Café': 'Café',
    'Otros': 'Otros',
    'Venta rapida': 'Otros',
    'Productos de temporada': 'Temporada',
    'Todos los productos': 'Otros',
  }
  return map[part] ?? 'Otros'
}

export async function importCSVAction(formData: FormData) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const file = formData.get('csv_file') as File
  if (!file || file.size === 0) redirect('/admin/importar?error=Selecciona+un+archivo+CSV')

  const text = await file.text()
  const rows = parseCSV(text)

  const simpleRows = rows.filter(r =>
    r['Tipo'] === 'simple' && r['Publicado'] === '1' && r['Nombre']?.trim()
  )

  const products = simpleRows
    .map(r => {
      const price = parseFloat(r['Precio normal'] || '0')
      const name = r['Nombre']?.trim()
      if (!name || price <= 0) return null
      const rawImages = r['Imágenes'] || ''
      const image_url = rawImages.split(',')[0].trim()
      const description = stripHtml(r['Descripción corta'] || r['Descripción'] || '')
      const category = mapCategory(r['Categorías'] || '')
      return { name, category, price_usd: price, cost_cup: 0, description, image_url, active: true }
    })
    .filter(Boolean) as {
      name: string; category: string; price_usd: number
      cost_cup: number; description: string; image_url: string; active: boolean
    }[]

  if (products.length === 0) redirect('/admin/importar?error=No+se+encontraron+productos+simples+publicados')

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').insert(products)

  if (error) redirect(`/admin/importar?error=${encodeURIComponent(error.message)}`)
  redirect(`/admin/importar?success=${products.length}`)
}
