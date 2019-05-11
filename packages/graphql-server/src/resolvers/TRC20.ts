export async function balance({ address, ownerAddress, contractObj }, args, context, info) {

  let [ balance, decimals ] = await Promise.all([
    contractObj.balanceOf(ownerAddress).call({
      from: ownerAddress
    }),
    contractObj.decimals().call({
      from: ownerAddress
    })
  ]);

  // horrible hack for CTT token :(
  if (balance.balance) {
    balance = balance.balance;
  }

  return balance.div(Math.pow(10, decimals)).toString();
}

export async function balanceSun({ address, ownerAddress, contractObj })  {
  let balance = await contractObj.balanceOf(ownerAddress).call({
    from: ownerAddress
  });

  if (balance.balance) {
    balance = balance.balance;
  }

  return balance.toString();
}

export async function totalSupply({ address, ownerAddress, contractObj }) {
  return (await contractObj.totalSupply().call({
    from: ownerAddress
  })).toString();
}

export async function decimals({ address, ownerAddress, contractObj })  {
  return (await contractObj.decimals().call({
    from: ownerAddress
  })).toString();
}

export async function name({ address, ownerAddress, contractObj })  {
  return (await contractObj.name().call({
    from: ownerAddress
  })).toString();
}

export async function symbol({ address, ownerAddress, contractObj })  {
  return (await contractObj.symbol().call({
    from: ownerAddress
  })).toString();
}
