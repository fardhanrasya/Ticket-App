const isUUID = (id: string) => {
    const uuidRegex = new RegExp('^[0-9a-fA-F]{24}$');
    return uuidRegex.test(id);
}

export default isUUID;