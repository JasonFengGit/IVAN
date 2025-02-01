export type NodeType = {
  host: string
  port?: number
  protocol?: 'https' | 'http'
  url?: string
  speed?: number
  status?: boolean
}

type CheckNodeProps = {
  hasAbort?: boolean
  params?: any
}

const request = async (url: string, params: any = {}, controller?: AbortController) => {
  const req = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    signal: controller?.signal,
  })
  return await req.json()
}

export const formatNode = (node: NodeType): NodeType => {
  const port = node.port
  const protocol = node.protocol || 'https'
  const url = `${protocol}://${node.host}`

  return {
    ...node,
    port,
    protocol,
    url,
    status: false,
    speed: Date.now(),
  }
}

export const CheckNode = async ({ node, params }: CheckNodeProps & { node: NodeType }): Promise<NodeType> => {
  const _node = formatNode(node) as any
  try {
    await request(_node.url, params)
    return { ..._node, speed: Date.now() - _node.speed, status: true }
  } catch (err) {
    return { ..._node, speed: TimeoutLimit, status: false }
  }
}
const TimeoutLimit = 9999999999
export const CheckNodes = async ({
  nodes,
  hasAbort = true,
  params,
}: CheckNodeProps & { nodes: NodeType[] }): Promise<NodeType[]> => {
  return new Promise((resolve, reject) => {
    let controllers: AbortController[] = []
    let status = false
    const _nodes: any = []

    nodes.forEach((node) => {
      const controller = new AbortController()
      if (status) return
      controllers.push(controller)
      setTimeout(() => {
        controller.abort()
      }, 6000)

      const _node = formatNode(node) as NodeType
      request(_node.url || '', params, controller)
        .then((res) => {
          if (res.error || res.err) {
            throw new Error('request fail')
          } else {
            _nodes.push({ ..._node, speed: Date.now() - (_node?.speed || 0), status: true })
          }

          if (hasAbort) {
            status = true
            controllers.forEach((c) => {
              c.abort()
            })
            controllers = []
            resolve(_nodes.sort((a, b) => (a.speed < b.speed ? -1 : 1)))
          }
        })
        .catch((err) => {
          _nodes.push({ ..._node, speed: TimeoutLimit, status: false })
        })
        .finally(() => {
          if (!hasAbort && _nodes.length === nodes.length) {
            resolve(_nodes.sort((a, b) => (a.speed < b.speed ? -1 : 1)))
          }
        })
    })
  })
}
