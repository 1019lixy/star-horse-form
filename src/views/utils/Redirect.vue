<script setup lang="ts">
import {unref} from 'vue';
import {useRouter} from 'vue-router';

const { currentRoute, replace } = useRouter();
const { params, query } = unref(currentRoute);
const { path, _redirect_type = 'path' } = params;
Reflect.deleteProperty(params, '_redirect_type');
Reflect.deleteProperty(params, 'path');
console.log(params, query, path);
const _path: any = query.redirectPath;
delete query['redirectPath'];
replace({
  path: _path.startsWith('/') ? _path : '/' + _path,
  query,
});
</script>
<template>
  <div></div>
</template>
