import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import {eslint} from 'rollup-plugin-eslint';

const dependencies = Object.keys({
    ...pkg.dependencies,
    ...pkg.peerDependencies
});

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs'
        },
        {
            file: pkg.module,
            format: 'es'
        }
    ],
    plugins: [
        eslint({throwOnError: true}),
        typescript({
            typescript: require('typescript')
        })
    ],
    external: dependencies
};
