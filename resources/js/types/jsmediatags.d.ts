declare module 'jsmediatags/dist/jsmediatags.min.js' {
    const jsmediatags: {
        read(
            file: File | string,
            callbacks: {
                onSuccess: (tag: { tags: { title?: string; artist?: string } }) => void;
                onError: (error: unknown) => void;
            },
        ): void;
    };
    export default jsmediatags;
}