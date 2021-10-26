let oso;

export default async function getOso(setupOso) {
  if (!oso) {
    const { Oso } = await import('oso')
    oso = new Oso()
    await setupOso(oso)
  }
  return oso
}
