import xhr from "axios";

export async function info({ host, port }) {
  try {
    const { data: { configNodeInfo, machineInfo } } = await xhr.get(`http://${host}:8090/wallet/getnodeinfo`, {
      timeout: 5000,
    });

    return {
      version: configNodeInfo.codeVersion,
      config: {
        maxTimeRatio: configNodeInfo.maxTimeRatio,
        minTimeRatio: configNodeInfo.minTimeRatio,
      },
      machine: {
        cpuCount: machineInfo.cpuCount,
        cpuRate: machineInfo.cpuRate,
        operatingSystemName: machineInfo.osName,
      },
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}
