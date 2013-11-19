global.$ROOT_DIR = process.cwd();
global.$SRC_DIR = $ROOT_DIR + (process.env.COVERAGE === '1' ? '/cov' : '/src');
global.$CFG_DIR = $ROOT_DIR + '/cfg';