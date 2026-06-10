export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  source: 'ai' | 'default' | 'custom'
}

export interface GeneratedTemplate {
  subject_line: string
  template: string
  tone: string
}

export function extractNameFromEmail(email: string): string {
  const local = email.split('@')[0]
  if (!local) return ''
  const cleaned = local.replace(/[._0-9]+$/, '').replace(/[._]/g, ' ')
  if (cleaned.length < 2) return ''
  return cleaned
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function getAlibabaDefaultTemplate(
  email: string,
  name?: string
): EmailTemplate {
  const recipientName = name || extractNameFromEmail(email) || 'Bapak/Ibu'
  const firstName = recipientName.split(' ')[0] || 'Bapak/Ibu'

  const subject =
    'Dukungan Resmi Alibaba Cloud untuk Akun Anda'

  const body = `Halo ${firstName},
Perkenalkan, saya Zuhdi, perwakilan resmi Alibaba Cloud yang ditugaskan mendampingi akun ${email}.

Saya di sini untuk memastikan Bapak/Ibu mendapatkan:
Rekomendasi infrastruktur IT yang sesuai kebutuhan teknis & skalabilitas bisnis
Informasi akurat mengenai cloud resources yang tersedia
Dukungan pengajuan discount atau incentive untuk project baru/ekspansi (jika memenuhi kriteria)

Sebagai langkah awal, saya akan menghubungi Bapak/Ibu via telepon hari ini atau besok untuk sekilas berdiskusi, hanya 5–10 menit, guna memahami apakah ada inisiatif atau kebutuhan infrastruktur yang bisa kami dukung secara optimal.

Mohon bantuan Bapak/Ibu untuk merespons panggilan tersebut, agar kami bisa memberikan support yang tepat sesuai prioritas tim Anda.
Terima kasih.

Best Regards,
Zuhdi Fadh
📧 zuhdifadh@alibaba-inc.com 
📞 Office: +62-21-278-99-855
🌐 www.alibabacloud.com`

  return {
    id: `default-${email}`,
    name: 'Default Intro (Alibaba Cloud)',
    subject,
    body,
    source: 'default',
  }
}

export function createCustomTemplate(
  id: string,
  name: string,
  subject: string,
  body: string
): EmailTemplate {
  return { id, name, subject, body, source: 'custom' }
}
